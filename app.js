import './main.less';
import Calendar from './components/calendar';
import Api from './components/api';
import Properties from './properties';

class App {
  constructor() {
    this.api = new Api();
    this.props = new Properties();
    this.cal = new Calendar();
    this.allEvents = [];
    this.groupIdx = 0;
  }

  aggregateEvents(events) {
    this.allEvents = this.allEvents.concat(events);
    this.groupIdx += 1;
    // if events have been retrieved for all groups, show the calendar
    if (this.groupIdx === this.props.groups.length) {
      this.cal.init('#calendar', this.allEvents);
      document.getElementById('loading').classList.add('hidden');
      document.getElementById('calendar').classList.remove('hidden');
    }
  }

  getAllEvents() {
    this.props.groups.forEach((group) => {
      if (typeof group === 'number') {
        this.api.getEventbriteEvents(group).then((events) => this.aggregateEvents(events));
      } else {
        this.api.getMeetupEvents(group).then((events) => this.aggregateEvents(events));
      }
    });
  }
}

const app = new App();
app.getAllEvents();
