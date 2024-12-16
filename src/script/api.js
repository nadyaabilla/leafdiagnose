const BASE_URL = 'https://capstone-project-backend-541569966272.asia-southeast2.run.app/';

const ENDPOINT = {
  predict: `${BASE_URL}/predict`,
};

class PredictAPI {
  static async predict(data) {
    const response = await fetch(ENDPOINT.predict, {
      method: 'POST',
      body: data,
      redirect: 'follow',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch prediction');
    }

    const json = await response.json();
    return json;
  }
}
