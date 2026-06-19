import { Metrics } from '../storage/metrics';
import { getHostStatus, HostStatus } from '../rest';

const updateStatus = (hostStatus: HostStatus) => {
  const {
    bookmarksCount: bookmarks,
    bookmarkChangesSent: changesSent,
    bookmarkChangesReceived: changesReceived,
  } = Metrics.instance.metrics;

  const bookmarksElement = document.getElementById('bookmarks');
  if (bookmarksElement) {
    bookmarksElement.innerText = bookmarks.toString();
  }
  const changesReceivedElement = document.getElementById('changesReceived');
  if (changesReceivedElement) {
    changesReceivedElement.innerText = changesReceived.toString();
  }
  const changesSentElement = document.getElementById('changesSent');
  if (changesSentElement) {
    changesSentElement.innerText = changesSent.toString();
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
  await Metrics.create();
  updateStatus(await getHostStatus());
});
