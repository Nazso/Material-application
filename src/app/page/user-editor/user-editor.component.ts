import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Observable, switchMap } from 'rxjs';
import { User } from 'src/app/model/user';
import { UserService } from '../../service/user.service';

@Component({
  selector: 'app-user-editor',
  templateUrl: './user-editor.component.html',
  styleUrls: ['./user-editor.component.scss']
})
export class UserEditorComponent implements OnInit {

  user$: Observable<User> | undefined;
  genders: string[] = ['Male', 'Female'];

  constructor(
    private userService: UserService,
    private ar: ActivatedRoute,
  ) { }

  ngOnInit(): void {
    this.user$ = this.ar.params.pipe(
      switchMap( params => (this.userService.get(params['id']) as Observable<User>) )
    );
  }

  formatLabel(value: number): string {
    return Math.round(value / 1000) + 'k';
  }

  async onSubmit(ngForm: NgForm, user: any): Promise<any> {
    console.log(ngForm.value);
    await this.userService.update(user.id, ngForm.value).toPromise();
    return history.back();
  }

}
