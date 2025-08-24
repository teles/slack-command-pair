/// <reference types="google-apps-script" />
import { readWholeSheet } from "./sheet";

// Web App (GET) só para validar no navegador
function doGet(_e: GoogleAppsScript.Events.DoGet) {
  const text = readWholeSheet("1o5xABbxLZVhn8Fl1ixz2MIzC1iXLOBQLJUFCK1SVMsE", "Pair");
  return ContentService.createTextOutput(text).setMimeType(ContentService.MimeType.TEXT);
}

// (Quando for usar Slash Command, você criará um doPost aqui)

// 👉 expõe as funções no escopo global do GAS
// (esbuild com IIFE não exporta automaticamente funções globais)
(globalThis as any).doGet = doGet;
// (globalThis as any).doPost = doPost; // quando existir
