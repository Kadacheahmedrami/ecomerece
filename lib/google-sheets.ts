import { google } from "googleapis"
import { Order, OrderItem } from "@prisma/client"
import path from 'path'
import fs from 'fs'

interface OrderWithItems extends Order {
  items: (OrderItem & {
    product: {
      name: string;
    };
  })[];
}

const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_SPREADSHEET_ID
const CREDENTIALS_PATH = process.env.GOOGLE_SHEETS_CREDENTIALS

// Store order IDs and their corresponding row numbers
const orderRowMap = new Map<string, string>()

async function getGoogleAuth() {
  try {
    // Read credentials from the JSON file
    const credentialsPath = path.resolve(process.cwd(), CREDENTIALS_PATH || './secrets.json')
    const credentials = JSON.parse(fs.readFileSync(credentialsPath, 'utf-8'))

    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    return auth;
  } catch (error) {
    console.error("Error initializing Google Auth:", error);
    throw error;
  }
}

export async function addOrderToGoogleSheet(order: OrderWithItems): Promise<void> {
  if (!SPREADSHEET_ID) {
    console.log("Google Sheets ID not configured, skipping sheet update");
    return;
  }

  try {
    const auth = await getGoogleAuth();
    const sheets = google.sheets({ version: 'v4', auth });
    
    // Format order items
    const items = order.items.map(item => 
      `${item.product.name} (${item.quantity}x) - $${item.price.toFixed(2)}`
    ).join(', ');

    const values = [
      [
        order.id,
        order.customerName,
        order.customerEmail,
        order.address,
        order.city,
        order.state,
        order.zipCode,
        order.country,
        order.phone,
        order.status,
        order.total.toFixed(2),
        items,
        new Date().toISOString()
      ]
    ];

    const response = await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Orders!A:M',
      valueInputOption: 'RAW',
      requestBody: {
        values,
      },
    });

    // Store the row ID for future updates
    if (response.data.updates?.updatedRange) {
      const range = response.data.updates.updatedRange;
      const rowId = range.split("!")[1].split(":")[0].replace(/[A-Z]/g, "");
      orderRowMap.set(order.id, rowId);
      console.log(`Order ${order.id} added to Google Sheet at row ${rowId}`);
    }

    console.log("Order added to Google Sheet successfully");
  } catch (error) {
    // Log the error but don't throw it
    console.error("Error adding order to Google Sheet:", error);
    // Continue execution - this is a non-critical error
  }
}

export async function updateOrderInGoogleSheet(order: OrderWithItems): Promise<void> {
  if (!SPREADSHEET_ID) {
    console.log("Google Sheets ID not configured, skipping update");
    return;
  }

  try {
    const auth = await getGoogleAuth();
    const sheets = google.sheets({ version: 'v4', auth });

    // First, find the order's row by searching for the order ID
    if (!orderRowMap.has(order.id)) {
      // If we don't have the row cached, search for it
      console.log(`Finding row for order ${order.id} in Google Sheet...`);
      
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: "Orders!A:A",
      });

      const rows = response.data.values || [];
      let rowNumber = -1;

      for (let i = 0; i < rows.length; i++) {
        if (rows[i][0] === order.id) {
          rowNumber = i + 1; // +1 because sheets are 1-indexed
          orderRowMap.set(order.id, rowNumber.toString());
          console.log(`Found order ${order.id} at row ${rowNumber}`);
          break;
        }
      }

      if (rowNumber === -1) {
        // Order not found in sheet
        console.log(`Order ${order.id} not found in Google Sheet, cannot update`);
        return;
      }
    }

    const rowId = orderRowMap.get(order.id);
    console.log(`Updating order ${order.id} status to "${order.status}" at row ${rowId}`);

    // Update only the status column (column H)
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `Orders!H${rowId}`,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [[order.status]],
      },
    });

    console.log(`Successfully updated order ${order.id} status in Google Sheet`);
  } catch (error) {
    console.error("Error updating order in Google Sheet:", error);
    // Re-throw the error so the caller can handle it
    throw error;
  }
}

