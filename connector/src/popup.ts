import { Storage, type Stats } from './storage';
import { isHostAlive } from './main';

const updateStatus = (stats: Stats, isAlive: boolean) => {
  const {
    bookmarks,
    changesReceived,
    changesProcessed,
    changesSent,
    pendingChanges,
  } = stats;

  const bookmarksElement = document.getElementById('bookmarks');
  if (bookmarksElement) {
    bookmarksElement.innerText = bookmarks.toString();
  }
  const changesReceivedElement = document.getElementById('changesReceived');
  if (changesReceivedElement) {
    changesReceivedElement.innerText = changesReceived.toString();
  }
  const changesProcessedElement = document.getElementById('changesProcessed');
  if (changesProcessedElement) {
    changesProcessedElement.innerText = changesProcessed.toString();
  }
  const changesSentElement = document.getElementById('changesSent');
  if (changesSentElement) {
    changesSentElement.innerText = changesSent.toString();
  }
  const pendingChangesElement = document.getElementById('pendingChanges');
  if (pendingChangesElement) {
    pendingChangesElement.innerText = pendingChanges.toString();
  }

  const hostStatusElement = document.getElementById('hostStatus');
  if (hostStatusElement) {
    hostStatusElement.innerHTML = isAlive
      ? '<div class="hostAlive">alive</div>'
      : '<div class="hostOffline">offline</div>';
  }
};

document.addEventListener('DOMContentLoaded', async () => {
  const storage = new Storage();
  await storage.init();
  await storage.loadStats();
  updateStatus(storage.stats, await isHostAlive());
});
