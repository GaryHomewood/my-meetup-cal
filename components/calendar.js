import moment from 'moment';

const meetupLogo = require('../img/meetup.png');
const eventbriteLogo = require('../img/eventbrite.png');

function createElement(tagName, className, innerText) {
  const ele = document.createElement(tagName);
  if (className) {
    ele.className = className;
  }
  if (innerText) {
    ele.textContent = innerText;
  }
  return ele;
}

class Calendar {
  constructor() {
    this.today = moment();
    this.current = moment().date(1);
    this.events = [];
  }

  draw() {
    this.drawHeader();
    this.drawMonth();
  }

  prevMonth() {
    this.current.subtract(1, 'months');
    this.next = false;
    this.draw();
  }

  nextMonth() {
    this.current.add(1, 'months');
    this.next = true;
    this.draw();
  }

  drawHeader() {
    const self = this;

    if (!this.header) {
      this.header = createElement('div', 'header');
      this.title = createElement('h2');
      this.header.appendChild(this.title);

      const prevMonthLink = createElement('a', 'prev-link');
      const leftArrow = createElement('div', 'left-arrow');
      prevMonthLink.appendChild(leftArrow);
      prevMonthLink.addEventListener('click', () => { self.prevMonth(); });
      this.header.appendChild(prevMonthLink);

      const nextMonthLink = createElement('a', 'next-link');
      const rightArrow = createElement('div', 'right-arrow');
      nextMonthLink.addEventListener('click', () => { self.nextMonth(); });
      nextMonthLink.appendChild(rightArrow);
      this.header.appendChild(nextMonthLink);

      this.el.appendChild(this.header);
    }

    this.title.innerHTML = this.current.format('MMMM YYYY');
  }

  getWeek(day) {
    if (!this.week || day.day() === 0) {
      this.week = createElement('div', 'week');
      this.month.appendChild(this.week);
    }
  }

  getDayClass(day) {
    const classes = ['day'];
    if (day.month() !== this.current.month()) {
      classes.push('other');
    } else if (this.today.isSame(day, 'day')) {
      classes.push('today');
    }
    return classes.join(' ');
  }

  showEventsIndicator(day, eventsIndicatorContainer) {
    if (day.month() === this.current.month()) {
      if (this.daysEvents(day).length > 0) {
        const span = createElement('span');
        eventsIndicatorContainer.appendChild(span);
      }
    }
  }

  showEvents(day, eventsContainer) {
    const events = this.daysEvents(day);
    const currentWrapper = eventsContainer.querySelector('.events');
    const wrapper = createElement('div', `events in${currentWrapper ? ' new' : ''}`);

    // add this days' events
    events.forEach((event) => {
      const eventContainer = createElement('div', 'event');

      const logo = createElement('img', 'platform-logo');
      if (event.platform === 'eventbrite') {
        logo.src = eventbriteLogo;
      } else if (event.platform === 'meetup') {
        logo.src = meetupLogo;
      }
      eventContainer.appendChild(logo);

      const eventDetail = createElement('div', 'event-detail');
      const eventLink = createElement('a', '', event.name);
      eventLink.href = event.url;
      const eventTime = `${event.start.format('h:mma')} - ${event.end.format('h:mma')}`;
      eventDetail.appendChild(eventLink);
      eventDetail.appendChild(createElement('span', 'event-time', eventTime));

      eventContainer.appendChild(eventDetail);
      wrapper.appendChild(eventContainer);
    });

    if (!events.length) {
      const div = createElement('div', 'event empty');
      const span = createElement('span', '', 'No events');
      div.appendChild(span);
      wrapper.appendChild(div);
    }

    if (currentWrapper) {
      currentWrapper.className = 'events out';
      currentWrapper.addEventListener('webkitAnimationEnd', () => {
        currentWrapper.parentNode.removeChild(currentWrapper);
        eventsContainer.appendChild(wrapper);
      });
      currentWrapper.addEventListener('oanimationend', () => {
        currentWrapper.parentNode.removeChild(currentWrapper);
        eventsContainer.appendChild(wrapper);
      });
      currentWrapper.addEventListener('msAnimationEnd', () => {
        currentWrapper.parentNode.removeChild(currentWrapper);
        eventsContainer.appendChild(wrapper);
      });
      currentWrapper.addEventListener('animationend', () => {
        currentWrapper.parentNode.removeChild(currentWrapper);
        eventsContainer.appendChild(wrapper);
      });
    } else {
      eventsContainer.appendChild(wrapper);
    }
  }

  showEventsPanel(dayElement) {
    let details;
    let arrow;
    const dayNumber = +dayElement.querySelectorAll('.day-number')[0].innerText || +dayElement.querySelectorAll('.day-number')[0].textContent;
    const day = this.current.clone().date(dayNumber);
    const currentOpened = document.querySelector('.details');

    if (currentOpened && currentOpened.parentNode === dayElement.parentNode) {
      // event panel already open for this week
      details = currentOpened;
      arrow = document.querySelector('.arrow');
    } else {
      if (currentOpened) {
        // close the open event panel on another week
        currentOpened.addEventListener('webkitAnimationEnd', () => { currentOpened.parentNode.removeChild(currentOpened); });
        currentOpened.addEventListener('oanimationend', () => { currentOpened.parentNode.removeChild(currentOpened); });
        currentOpened.addEventListener('msAnimationEnd', () => { currentOpened.parentNode.removeChild(currentOpened); });
        currentOpened.addEventListener('animationend', () => { currentOpened.parentNode.removeChild(currentOpened); });
        currentOpened.className = 'details out';
      }
      // create an event panel for this week
      details = createElement('div', 'details in');
      arrow = createElement('div', 'arrow');
      details.appendChild(arrow);
      dayElement.parentNode.appendChild(details);
    }

    this.showEvents(day, details);

    // reposition arrow
    arrow.style.left = `${dayElement.offsetLeft - dayElement.parentNode.offsetLeft + 27}px`;
  }

  daysEvents(day) {
    return this.events.reduce((accumulator, event) => {
      if (event.start.isSame(day, 'day')) {
        accumulator.push(event);
      }
      return accumulator;
    }, []);
  }

  drawDay(day) {
    const self = this;
    this.getWeek(day);

    const outer = createElement('div', this.getDayClass(day));
    outer.addEventListener('click', (el) => { self.showEventsPanel(el.target.parentNode); });

    const name = createElement('div', 'day-name', day.format('ddd'));
    const number = createElement('div', 'day-number', day.format('DD'));
    const eventsIndicator = createElement('div', 'day-events');
    this.showEventsIndicator(day, eventsIndicator);

    outer.appendChild(name);
    outer.appendChild(number);
    outer.appendChild(eventsIndicator);
    this.week.appendChild(outer);
  }

  drawDaysInPreviousMonth() {
    const clone = this.current.clone();
    const dayOfWeek = clone.day();
    if (!dayOfWeek) { return; }

    clone.subtract(dayOfWeek + 1, 'days');

    for (let i = dayOfWeek; i > 0; i -= 1) {
      this.drawDay(clone.add(1, 'days'));
    }
  }

  drawCurrentMonth() {
    const clone = this.current.clone();

    while (clone.month() === this.current.month()) {
      this.drawDay(clone);
      clone.add(1, 'days');
    }
  }

  drawDaysInNextMonth() {
    const clone = this.current.clone().add(1, 'months').subtract(1, 'days');
    const dayOfWeek = clone.day();
    if (dayOfWeek === 6) { return; }

    for (let i = dayOfWeek; i < 6; i += 1) {
      this.drawDay(clone.add(1, 'days'));
    }
  }

  drawMonth() {
    const self = this;

    if (this.month) {
      this.oldMonth = this.month;
      this.oldMonth.className = `month out ${self.next ? 'next' : 'prev'}`;
      this.oldMonth.addEventListener('webkitAnimationEnd', () => {
        self.oldMonth.parentNode.removeChild(self.oldMonth);
        self.month = createElement('div', 'month');
        self.drawDaysInPreviousMonth();
        self.drawCurrentMonth();
        self.drawDaysInNextMonth();
        self.el.appendChild(self.month);
        window.setTimeout(() => {
          self.month.className = `month in ${self.next ? 'next' : 'prev'}`;
        }, 16);
      });
    } else {
      this.month = createElement('div', 'month');
      this.el.appendChild(this.month);
      this.drawDaysInPreviousMonth();
      this.drawCurrentMonth();
      this.drawDaysInNextMonth();
      this.month.className = 'month new';
    }
  }

  init(selector, events) {
    this.el = document.querySelector(selector);
    this.events = events;
    this.draw();
    // if today's date is visible, show today's events
    const todayElement = document.querySelector('.today');
    if (todayElement) {
      const self = this;
      window.setTimeout((() => self.showEventsPanel(todayElement)), 500);
    }
  }
}

export default Calendar;
