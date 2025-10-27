// public/app.js
(() => {
  const socket = io(); // connects to same origin
  const rows = document.getElementById('rows');
  const status = document.getElementById('status');
  const snapshotBtn = document.getElementById('snapshotBtn');
  const intervalSelect = document.getElementById('intervalSelect');

  let symbols = [];
  let last