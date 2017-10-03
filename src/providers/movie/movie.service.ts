import { SQLiteObject } from '@ionic-native/sqlite';
import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map';

import { SqliteHelperService } from './../sqlite-helper/sqlite-helper.service';
import { Movie } from '../../models/movie.model';

@Injectable()
export class MovieService {

  private db: SQLiteObject;
  private isFirstCall: boolean = true;

  constructor(
    public sqlliteHelperService: SqliteHelperService
  ) {

  }

  private getDb(): Promise<SQLiteObject> {
    if (this.isFirstCall) {
      this.isFirstCall = false;

      return this.sqlliteHelperService.getDb('movie.db')
        .then((db: SQLiteObject) => {
          this.db = db;
          this.db.executeSql('CREATE TABLE IF NOT EXISTS movie (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT)', {})
            .then((success) => {
              console.log('Tabela criada com sucesso', success);
            })
            .catch((error) => {
              console.log('erro ao criar tabela', error);
            })
          return this.db;
        })
    }
    return this.sqlliteHelperService.getDb();
  }

  public getAll(orderBy?: string): Promise<Movie[]> {
    return this.getDb()
      .then((db: SQLiteObject) => {

        return <Promise<Movie[]>>this.db.executeSql(`SELECT id, title FROM movie ORDER BY id ${orderBy || 'DESC'}`, {})
          .then((resultSet) => {
            let list: Movie[] = [];
            for (let i = 0; i < resultSet.rows.length; i++) {
              list.push(resultSet.rows.item(i));
            }
            return list;
          })
          .catch((error: Error) => console.log('Erro', error))
      })
  }

  public create(movie: Movie): Promise<Movie> {
    return this.db.executeSql('INSERT INTO movie (title) VALUES (?)', [movie.title])
      .then(resultSet => {
        movie.id = resultSet.insertId;
        return movie;
      })
      .catch((error: Error) => {
        console.log(`Erro ao criar '${movie.title}' movie!`, error)
        return movie;
      });
  }

  public update(movie: Movie): Promise<boolean> {
    return this.db.executeSql('UPDATE movie SET title = ? WHERE id=?', [movie.title, movie.id])
      .then(resultSet => resultSet.rowsAffected >= 0)
      .catch((error: Error) => {
        console.log(`Erro ao atualizar movie!`, error)
        return false
      });
  }

  public delete(id: number): Promise<boolean> {
    return this.db.executeSql('DELETE FROM movie WHERE id=?', [id])
      .then(resultSet => resultSet.rowsAffected >= 0)
      .catch((error: Error) => {
        console.log(`Erro ao deletar movie!`, error)
        return false;
      });
  }

  public getById(id: number): Promise<Movie> {
    return this.db.executeSql('SELECT id, title FROM movie WHERE id=?', [id])
      .then(resultSet => {
        return resultSet.rows.item(0);
      })
      .catch((error: Error) => {
        console.log(`Erro ao encontrar movie!`, error)
      });
  }
}
