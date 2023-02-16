import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class VidRequestService {

  constructor(private http: HttpClient) { }

    apiKey = 'AIzaSyB7NPvyrv0bPIhedYBveQQIUlXBTIo0L-g';

callYoutubeApi(searchTerm: string) {
  return this.http.get(`https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=20&q=${searchTerm}&type=video&key=${this.apiKey}
  `)
}



}
