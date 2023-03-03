import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class VidRequestService {

  constructor(private http: HttpClient) { }

    apiKey = 'AIzaSyB7NPvyrv0bPIhedYBveQQIUlXBTIo0L-g';
    nbaChanId = 'UCWJ2lWNubArHWmf3FIHbfcQ';
    nflChanId = 'UCDVYQ4Zhbm3S2dlz7P1GBDg';
    premiereLeagueChanId = 'UCqZQlzSHbVJrwrn5XvzrzcA';

callYoutubeApi(searchTerm: string, chanId?: string) {
  return this.http.get(`https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=20&q=${searchTerm}${chanId ? '&channelId=' + chanId : ''}&type=video&key=${this.apiKey}
  `)
}



}
