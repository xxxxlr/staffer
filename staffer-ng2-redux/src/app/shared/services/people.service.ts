import { Injectable } from '@angular/core';
import { Http, Response, URLSearchParams } from '@angular/http';
import { Observable } from 'rxjs';

import { Need, Person } from '../models/index'
import { peopleUrl } from '../config/app.config';

@Injectable()
export class PeopleService {

    constructor(private http: Http) {
    }

    getPeople(need: Need): Observable<any> {

        let searchParams: URLSearchParams = new URLSearchParams();
        if (need) {
            searchParams.set('needId', need.id.toString());
            searchParams.set('skillId', need.skillId.toString());
            searchParams.set('availableFrom', need.startDate.toISOString());
            searchParams.set('availableTo', need.endDate.toISOString());
        }

        return this.http
            .get(peopleUrl, { search: searchParams })
            .map(response => this.extractData(response))
            .catch(this.handleError);
    }

    assign(personId: number, needId: number) {
        return this.http
            .post(peopleUrl + '/' + personId + '/needs/' + needId, '')
            .map(response => this.extractData(response))
            .catch(this.handleError);
    }

    unassign(personId: number, needId: number) {
        return this.http
            .delete(peopleUrl + '/' + personId + '/needs/' + needId)
            .map(response => this.extractData(response))
            .catch(this.handleError);
    }

    private extractData(response: Response) {
        if (response.status < 200 || response.status >= 300) {
            throw new Error('Bad response status: ' + response.status);
        }

        let result = response.json();

        // If result has a need, convert ISO dates to Date objects
        if (result.need) {
            Need.parse(result.need);
        };

        return result;
    }

    private handleError(errorResponse: Response) {
        let body = errorResponse.json();
        let message = body.message ?
            body.message :
            (errorResponse.statusText || 'unknown error');
        return Observable.throw(message);
    }
}
