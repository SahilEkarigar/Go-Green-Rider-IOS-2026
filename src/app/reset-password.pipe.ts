import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'resetPassword',
  standalone: true
})
export class ResetPasswordPipe implements PipeTransform {

  transform(value: unknown, ...args: unknown[]): unknown {
    return null;
  }

}
