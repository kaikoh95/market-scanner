// lib/orderBook.ts
import { EventEmitter } from "events";
import WebSocket from "ws";

// Define the shape of an order event.
export interface OrderEvent {
  symbol: string;
  price: number;
  volume: number;
  side: string; // "trade" for our trade events
  timestamp: Date;
}

// Global in‑memory order book: maps symbol to an array of OrderEvent.
export const orderBook: Record<string, OrderEvent[]> = {};

// Create an EventEmitter to notify subscribers (e.g., our SSE clients) about alerts.
export const alertEmitter = new EventEmitter();

// Anomaly detection threshold: any trade with volume above this will trigger an alert.
const ANOMALY_VOLUME_THRESHOLD = 1000;

/**
 * Process an order event by updating the order book and checking for anomalies.
 */
function processOrderEvent(event: OrderEvent) {
  const symbol = event.symbol.toUpperCase();
  if (!orderBook[symbol]) {
    orderBook[symbol] = [];
  }
  orderBook[symbol].push(event);

  // If the volume exceeds the threshold, emit an alert.
  if (event.volume > ANOMALY_VOLUME_THRESHOLD) {
    const alertMessage = `Anomaly detected: ${event.symbol} trade with volume ${event.volume} at $${event.price} on ${event.timestamp.toISOString()}`;
    alertEmitter.emit("alert", alertMessage);
    console.log(alertMessage);
  }
}

/**
 * Connect to Polygon.io's WebSocket endpoint for live stock trade data.
 * You must have your POLYGON_API_KEY set in your environment variables.
 */
function connectPolygon() {
  const POLYGON_API_KEY = process.env.POLYGON_API_KEY;
  if (!POLYGON_API_KEY) {
    console.error("Polygon.io API key not set. Please add POLYGON_API_KEY to your .env.local file.");
    return;
  }

  // Polygon.io WebSocket endpoint for stocks.
  const wsUrl = "wss://socket.polygon.io/stocks";
  const ws = new WebSocket(wsUrl);

  ws.on("open", () => {
    console.log("Connected to Polygon.io WebSocket.");
    // Authenticate using your API key.
    ws.send(JSON.stringify({ action: "auth", params: POLYGON_API_KEY }));
    // Subscribe to trade events for selected symbols (e.g., AAPL, GOOG, TSLA, AMZN).
    ws.send(JSON.stringify({ action: "subscribe", params: "T.AAPL,T.GOOG,T.TSLA,T.AMZN" }));
  });

  ws.on("message", (data: WebSocket.Data) => {
    try {
      // Polygon.io sends an array of messages.
      const messages = JSON.parse(data.toString());
      if (Array.isArray(messages)) {
        messages.forEach((msg: any) => {
          // We only process trade events ("T" events).
          if (msg.ev === "T") {
            // Expected trade message example:
            // { "ev": "T", "sym": "AAPL", "p": 130.5, "s": 100, "t": 1617657380000, ... }
            const orderEvent: OrderEvent = {
              symbol: msg.sym,
              price: msg.p,
              volume: msg.s,
              side: "trade", // Trade events don't specify a side; we use a generic label.
              timestamp: new Date(msg.t)
            };
            processOrderEvent(orderEvent);
          }
        });
      }
    } catch (err) {
      console.error("Error parsing Polygon message:", err);
    }
  });

  ws.on("error", (err) => {
    console.error("Polygon WebSocket error:", err);
  });

  ws.on("close", () => {
    console.log("Polygon WebSocket closed. Reconnecting in 5 seconds...");
    setTimeout(connectPolygon, 5000);
  });
}

// Start the connection if it hasn't been started already.
if (!globalThis.__polygonConnected) {
  connectPolygon();
  globalThis.__polygonConnected = true;
}
