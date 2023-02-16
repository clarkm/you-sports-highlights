import { Component } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { SafePipe } from './safe.pipe';
import { VidRequestService } from './vid-request.service';
import { take } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  results$: any;

  vidList: any;

  constructor(private vidRequestService: VidRequestService) {}

  search(term: string) {
    this.results$ = this.vidRequestService.callYoutubeApi(term);

    this.results$.pipe(take(1)).subscribe((res: any) => {
      // debugger
      this.vidList = res.items
    })
  }

  
}
