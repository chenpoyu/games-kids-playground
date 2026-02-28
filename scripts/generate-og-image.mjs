import { createCanvas } from 'canvas';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const WIDTH = 1200;
const HEIGHT = 630;

const canvas = createCanvas(WIDTH, HEIGHT);
const ctx = canvas.getContext('2d');

// Background gradient
const bgGrad = ctx.createLinearGradient(0, 0, WIDTH, HEIGHT);
bgGrad.addColorStop(0, '#667eea');
bgGrad.addColorStop(0.5, '#764ba2');
bgGrad.addColorStop(1, '#f093fb');
ctx.fillStyle = bgGrad;
ctx.fillRect(0, 0, WIDTH, HEIGHT);

// Decorative circles
const circles = [
  { x: 100, y: 80, r: 60 },
  { x: 1100, y: 100, r: 80 },
  { x: 200, y: 550, r: 100 },
  { x: 1050, y: 500, r: 70 },
  { x: 600, y: 50, r: 40 },
];
circles.forEach(c => {
  ctx.beginPath();
  ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2);
  ctx.fillStyle = `rgba(255,255,255,0.1)`;
  ctx.fill();
});

// Main card
ctx.save();
const cardX = 120, cardY = 100, cardW = 960, cardH = 430, cardR = 30;
ctx.beginPath();
ctx.moveTo(cardX + cardR, cardY);
ctx.lineTo(cardX + cardW - cardR, cardY);
ctx.quadraticCurveTo(cardX + cardW, cardY, cardX + cardW, cardY + cardR);
ctx.lineTo(cardX + cardW, cardY + cardH - cardR);
ctx.quadraticCurveTo(cardX + cardW, cardY + cardH, cardX + cardW - cardR, cardY + cardH);
ctx.lineTo(cardX + cardR, cardY + cardH);
ctx.quadraticCurveTo(cardX, cardY + cardH, cardX, cardY + cardH - cardR);
ctx.lineTo(cardX, cardY + cardR);
ctx.quadraticCurveTo(cardX, cardY, cardX + cardR, cardY);
ctx.closePath();

ctx.shadowColor = 'rgba(0,0,0,0.3)';
ctx.shadowBlur = 16;
ctx.shadowOffsetY = 4;
ctx.fillStyle = 'rgba(255,255,255,0.95)';
ctx.fill();
ctx.restore();

// Rainbow bar
const rainbowColors = ['#ff6b6b', '#ffa502', '#ffd93d', '#6bcb77', '#4d96ff', '#9b59b6'];
const barW = cardW / rainbowColors.length;
rainbowColors.forEach((color, i) => {
  ctx.fillStyle = color;
  ctx.fillRect(cardX + i * barW, cardY, barW + 1, 12);
});

// Title
ctx.fillStyle = '#2d3436';
ctx.font = '900 68px sans-serif';
ctx.textAlign = 'center';
ctx.fillText('🌈 歡樂小遊戲樂園', 600, 280);

// Subtitle
ctx.fillStyle = '#636e72';
ctx.font = '400 28px sans-serif';
ctx.fillText('專為 3-6 歲兒童設計的互動學習遊戲平台', 600, 340);

// Game icons
const icons = ['🎨', '🧩', '🎈', '🔢', '🔤', '📐'];
icons.forEach((icon, i) => {
  ctx.font = '46px sans-serif';
  ctx.fillText(icon, 240 + i * 130, 190);
});

// Tags
const tags = [
  { text: '顏色配對', color: '#ff6b6b' },
  { text: '動物拼圖', color: '#ffa502' },
  { text: '數字學習', color: '#6bcb77' },
  { text: 'ABC 英文', color: '#4d96ff' },
  { text: '注音學習', color: '#9b59b6' },
];
tags.forEach((tag, i) => {
  const tx = 210 + i * 160;
  // Rounded rect
  const tw = 140, th = 42, tr = 21;
  ctx.beginPath();
  ctx.moveTo(tx + tr, 400);
  ctx.lineTo(tx + tw - tr, 400);
  ctx.quadraticCurveTo(tx + tw, 400, tx + tw, 400 + tr);
  ctx.lineTo(tx + tw, 400 + th - tr);
  ctx.quadraticCurveTo(tx + tw, 400 + th, tx + tw - tr, 400 + th);
  ctx.lineTo(tx + tr, 400 + th);
  ctx.quadraticCurveTo(tx, 400 + th, tx, 400 + th - tr);
  ctx.lineTo(tx, 400 + tr);
  ctx.quadraticCurveTo(tx, 400, tx + tr, 400);
  ctx.closePath();
  ctx.fillStyle = tag.color;
  ctx.globalAlpha = 0.9;
  ctx.fill();
  ctx.globalAlpha = 1;

  ctx.fillStyle = 'white';
  ctx.font = '700 17px sans-serif';
  ctx.fillText(tag.text, tx + tw / 2, 428);
});

// Bottom tagline
ctx.fillStyle = '#a29bfe';
ctx.font = '700 22px sans-serif';
ctx.fillText('🎮 寓教於樂 · 快樂學習 · 安全無廣告', 600, 495);

// Save
const buffer = canvas.toBuffer('image/png');
const outPath = path.join(__dirname, '..', 'public', 'og-image.png');
fs.writeFileSync(outPath, buffer);
console.log(`✅ OG image generated: ${outPath}`);
