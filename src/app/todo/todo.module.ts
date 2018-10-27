import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TodoRoutingModule } from './todo-routing.module';
import { GraphQLModule } from './graph-ql.module';

@NgModule({
  imports: [
    CommonModule,
    TodoRoutingModule,
    GraphQLModule
  ],
  declarations: []
})
export class TodoModule { }
