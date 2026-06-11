import { Storage, type Stats } from './storage';
import { getHostStatus, HostStatus } from './main';

const updateStatus = (stats: Stats, hostStatus: HostStatus) => {
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
    if (hostStatus === HostStatus.Inactive) {
      hostStatusElement.innerHTML = '<div class="hostOffline">online</div>';
    } else if (hostStatus === HostStatus.Alive) {
      hostStatusElement.innerHTML = '<div class="hostAlive">alive</div>';
    } else {
      hostStatusElement.innerHTML = '<div class="hostUnknown">unknown</div>';
    }
  }
};

document.addEventListener('DOMContentLoaded', async () => {
  const storage = new Storage();
  await storage.init();
  await storage.getStats();
  updateStatus(storage.stats, await getHostStatus());
});
