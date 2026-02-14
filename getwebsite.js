import http from 'k6/http';
import { check } from 'k6';

export default function (){
    const res = http.get('http://luma-demo.scandipwa.com/')

    check(res, {
        'is status 200': (r) => r.status === 200,
    });
}