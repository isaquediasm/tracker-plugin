import { http } from './api';

export const events = {
  async create(ev) {
    const data = {
      name: ev.eventName,
      value: ev.eventValue,
      trigger: ev.trigger,
      occurrenceType: ev.occurrenceLimit,
      page: ev.occurrence === 'PAGE' ? window.location.pathname : '',
    };

    const options = {
      method: 'POST',
      body: JSON.stringify(data),
    };

    const res = await http(`/events`, options);

    console.log(res);
  },

  async list() {
    return await http('/events', {
      method: 'GET',
    });
  },
};
