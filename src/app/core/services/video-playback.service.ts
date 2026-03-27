import { Injectable } from '@angular/core';
import { Observable, from, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

/**
 * Reduz exposição da URL original no DOM usando `blob:` quando o servidor/CDN permite CORS.
 * A URL ainda pode aparecer na aba Network; mascaramento total exige streaming via backend.
 */
@Injectable({ providedIn: 'root' })
export class VideoPlaybackService {
  resolvePlayableUrl(remoteUrl: string): Observable<string> {
    return from(
      fetch(remoteUrl, { mode: 'cors', credentials: 'omit' }).then((r) => {
        if (!r.ok) {
          throw new Error('fetch failed');
        }
        return r.blob();
      }),
    ).pipe(
      map((blob) => URL.createObjectURL(blob)),
      catchError(() => of(remoteUrl)),
    );
  }

  revokeUrl(url: string | null): void {
    if (url?.startsWith('blob:')) {
      URL.revokeObjectURL(url);
    }
  }
}
