/**
 * Customer accounts (email + password chosen after purchase).
 * Passwords are hashed with scrypt; salt stored per customer.
 */

import { promises as fs } from "fs";
import path from "path";
import { randomBytes, scryptSync, timingSafeEqual } from "crypto";

const DATA_DIR = path.join(process.cwd(), "data");
const CUSTOMERS_PATH = path.join(DATA_DIR, "customers.json");
const SALT_LEN = 16;
const KEY_LEN = 64;
const SCRYPT_OPTS = { N: 16384, r: 8, p: 1 };

export type CustomerRecord = {
  email: string;
  salt: string; // base64
  hash: string; // base64
};

async function readCustomers(): Promise<CustomerRecord[]> {
  try {
    const raw = await fs.readFile(CUSTOMERS_PATH, "utf-8");
    return JSON.parse(raw) as CustomerRecord[];
  } catch {
    return [];
  }
}

async function writeCustomers(records: CustomerRecord[]): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(CUSTOMERS_PATH, JSON.stringify(records, null, 2), "utf-8");
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export async function verifyCustomer(
  email: string,
  password: string
): Promise<boolean> {
  const normalized = normalizeEmail(email);
  const records = await readCustomers();
  const customer = records.find((r) => r.email === normalized);
  if (!customer) return false;

  const salt = Buffer.from(customer.salt, "base64");
  const storedHash = Buffer.from(customer.hash, "base64");
  const derived = scryptSync(password, salt, KEY_LEN, SCRYPT_OPTS);
  return derived.length === storedHash.length && timingSafeEqual(derived, storedHash);
}

export async function createCustomer(
  email: string,
  password: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const normalized = normalizeEmail(email);
  if (!normalized || !password || password.length < 8) {
    return { ok: false, error: "Email and password (min 8 characters) required." };
  }

  const records = await readCustomers();
  if (records.some((r) => r.email === normalized)) {
    return { ok: false, error: "An account with this email already exists." };
  }

  const salt = randomBytes(SALT_LEN);
  const hash = scryptSync(password, salt, KEY_LEN, SCRYPT_OPTS);

  records.push({
    email: normalized,
    salt: salt.toString("base64"),
    hash: hash.toString("base64"),
  });
  await writeCustomers(records);
  return { ok: true };
}
