import * as React from 'react';

import { UserComponent } from './component';

export default async function Page() {
  // const todos: Array<string> = (await getAllTodo()) ?? [];
  const todos: Array<string> = [];
  return <UserComponent todos={todos} />;
}
