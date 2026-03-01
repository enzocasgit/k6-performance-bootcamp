import http from 'k6/http';
import { sleep, check, group } from 'k6';

export const options = {
  stages: [
    { duration: '1m', target: 5 },
    { duration: '2m', target: 5 },
    { duration: '30s', target: 0 },
  ],
  thresholds: {
    http_req_failed: ['rate<0.05'],
    http_req_duration: ['p(95)<2000'],
  },
};

const BASE_URL = 'https://luma-demo.scandipwa.com';
const GRAPHQL_URL = `${BASE_URL}/graphql`;

export default function () {
  
  group('01_Acesso_Homepage', function () {
    const res = http.get(BASE_URL, { tags: { name: 'Home' } });
    
    check(res, {
      'status homepage é 200OK': (r) => r.status === 200,
    });
  });

  sleep(5);

  group('02_Busca_Produtos', function () {
    const query = `
      query getProducts($search: String!) {
        products(search: $search, pageSize: 6) {
          items {
            name
            sku
          }
        }
      }`;

    const payload = JSON.stringify({
      query: query,
      variables: { search: "bag" }
    });

    const params = {
      headers: { 'Content-Type': 'application/json' },
      tags: { name: 'GraphQL_Search' }
    };

    const res = http.post(GRAPHQL_URL, payload, params);

    const is200 = check(res, {
      'status graphql é 200OK': (r) => r.status === 200,
    });

    if (is200 && res.body) {
      try {
        const body = res.json();
        check(body, {
          'retornou dados validos': (b) => b.data !== undefined && b.data.products.items.length >= 0,
        });
      } catch (e) {
        console.warn(`Falha ao converter JSON. Status: ${res.status}`);
      }
    }
  });

  sleep(5);
}