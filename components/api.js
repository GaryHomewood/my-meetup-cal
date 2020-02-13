import moment from 'moment';
import Properties from '../properties';

class Api {
  constructor() {
    this.eventbriteUrlRoot = 'https://www.eventbriteapi.com/v3/organizers/';
    this.meetupUrlRoot = 'https://api.meetup.com/';
    this.cors = 'https://cors-anywhere.herokuapp.com/';
    this.props = new Properties();
    this.eventbriteToken = this.props.eventbriteToken;
  }

  getEventbriteEvents(id) {
    return fetch(`${this.cors}${this.eventbriteUrlRoot}/${id}/events/?token=${this.eventbriteToken}&status=live`)
      .then((resp) => {
        if (resp.status === 200) {
          return resp.json();
        }
        throw new Error(resp.statusText);
      })
      .then((data) => data.events.map((ev) => ({
        name: ev.name.text,
        url: ev.url,
        start: moment(ev.start.local),
        end: moment(ev.end.local),
        platform: 'eventbrite',
      })))
      .catch((err) => {
        // eslint-disable-next-line no-console
        console.log(err);
      });
  }

  getMeetupEvents(group) {
    return fetch(`${this.cors}${this.meetupUrlRoot}${group}/events`)
      .then((resp) => {
        if (resp.status === 200) {
          return resp.json();
        }
        throw new Error(resp.statusText);
      })
      .then((data) => data.map((ev) => ({
        name: ev.name,
        url: ev.link,
        start: moment(ev.time),
        end: moment(ev.time + ev.duration),
        platform: 'meetup',
      })))
      .catch((err) => {
        // eslint-disable-next-line no-console
        console.log(err);
      });
  }
}

export default Api;
