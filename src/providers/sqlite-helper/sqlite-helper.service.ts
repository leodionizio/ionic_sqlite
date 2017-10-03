import { Injectable } from '@angular/core';
import { Platform } from 'ionic-angular';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite';

@Injectable()
export class SqliteHelperService {
  private db: SQLiteObject;

  constructor(
    public platform: Platform,
    private sqlite: SQLite
  ) {
  }

  private createDatabase(dbName?: string): Promise<SQLiteObject> {
    return this.platform.ready()
      .then((readySource: string) => {

        return this.sqlite.create({
          name: dbName || 'dbDefault.db',
          location: 'default'
        }).then((db: SQLiteObject) => {
          this.db = db;
          return this.db;
        }).catch((error: Error) => {
          console.log('Erro: ', error);
          return Promise.reject(error.message || error);
        })
      })
  }

  public getDb(dbName?: string, newOpen?: boolean): Promise<SQLiteObject> {
    if (newOpen) return this.createDatabase(dbName);
    return (this.db) ? Promise.resolve(this.db) : this.createDatabase(dbName);
  }
}
