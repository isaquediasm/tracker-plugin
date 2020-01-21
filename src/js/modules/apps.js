import { http } from '../utils/api';

export default {
  async list() {
    return await http('/apps', {
      method: 'GET',
    });
  },
};
