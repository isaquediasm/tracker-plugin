import { http } from './api';

export const events = {
  async create(data) {
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
