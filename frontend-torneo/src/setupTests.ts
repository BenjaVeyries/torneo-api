// src/setupTests.ts
import '@testing-library/jest-dom';
// Polyfill TextEncoder/TextDecoder for jsdom (Node < 11)
import { TextEncoder, TextDecoder } from 'util';
// @ts-ignore
global.TextEncoder = TextEncoder as any;
// @ts-ignore
global.TextDecoder = TextDecoder as any;
