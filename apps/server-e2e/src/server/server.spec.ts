import axios from 'axios';

describe('GET /api/v1/todos', () => {
  it('should return an array of todos', async () => {
    const res = await axios.get(`/api/v1/todos`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.data)).toBe(true);
  });
});
