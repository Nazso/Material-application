import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { Subscription, take } from 'rxjs';
import { User } from 'src/app/model/user';
import { UserService } from 'src/app/service/user.service';
import { MessageService } from '../../service/message.service';

@Component({
  selector: 'app-editable',
  templateUrl: './editable.component.html',
  styleUrls: ['./editable.component.scss']
})
export class EditableComponent implements OnInit {

  dataSource: MatTableDataSource<User> = new MatTableDataSource<User>();
  displayedColumns: string[] = [
    'id',
    'first_name',
    'last_name',
    'gender',
    'email',
    'address',
    'actions',
  ];

  pageSizes: number[] = [5, 10, 25, 100];
  dataSubscription: Subscription | undefined;
  currentFilterKey?: string;

  @ViewChild(MatPaginator, {static: true}) paginator!: MatPaginator;
  @ViewChild('dialogTemplate') dialogTemplate?: TemplateRef<any>;

  constructor(
    private userService: UserService,
    private router: Router,
    private messageService: MessageService,
  ) { }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLocaleLowerCase();
  }

  ngOnInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSubscription = this.userService.watcher$.subscribe(
      users => this.dataSource.data = (users as unknown as User[])
    );
    this.userService.refresh();

    this.dataSource.filterPredicate = (data: any, filter: string) => {
      const key = this.currentFilterKey || '';
      const source = key ? String(data[key]) : JSON.stringify(data);
      return source.toLocaleLowerCase().includes(filter.toLocaleLowerCase());
    };
  }

  ngOnDestroy(): void {
    this.dataSubscription?.unsubscribe();
  }

  onEdit(user: User): void {
    this.router.navigate(['editable', 'edit', user.id]);
  }

  onDelete(user: any): void {
    const dialogData = {
      title: 'Are you sure?',
      content: 'The user will be deleted permanently!',
      template: this.dialogTemplate,
    };

    this.messageService.openDialog(dialogData).pipe(
      take(1)
    ).subscribe(
      result => {
        if (!result) {
          return;
        }
        this.userService.delete(user.id).toPromise().then(
          response => this.messageService.openSnackBar(
            3000, 
            'User has benn deleted!'
          ),
          err => console.error(err)
        );
      }
    )

  }

}
