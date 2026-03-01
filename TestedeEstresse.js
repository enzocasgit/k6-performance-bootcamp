import http from 'k6/http';
import { sleep, check, group } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 10 },
    { duration: '1m', target: 30 },
    { duration: '20s', target: 0 },
  ],
};

const BASE_URL = 'https://luma-demo.scandipwa.com';
const GRAPHQL_URL = `${BASE_URL}/graphql`;

export default function () {
  
  group('01_Acesso_Homepage', function () {
    const res = http.get(BASE_URL);
    check(res, { 'homepage status 200OK': (r) => r.status === 200 });
  });

  sleep(2);

  group('02_Busca_Produtos', function () {
    const query = `
      query getProducts($search: String!) {
        products(search: $search, pageSize: 10) {
          items {
            name
            sku
            price_range {
              minimum_price {
                final_price { value }
              }
            }
          }
        }
      }`;

    const payload = JSON.stringify({
      query: query,
      variables: { search: "bag" }
    });

    const params = {
      headers: { 'Content-Type': 'application/json' },
    };

    const res = http.post(GRAPHQL_URL, payload, params);

    check(res, {
      'graphql status 200OK': (r) => r.status === 200,
      'produtos encontrados': (r) => r.json().data.products.items.length > 0,
    });
  });

  sleep(3);
}