import { Component } from '@angular/core';
import { NavController, AlertController, ItemSliding, AlertOptions, LoadingController, Loading } from 'ionic-angular';

import { Movie } from './../../models/movie.model';
import { MovieService } from './../../providers/movie/movie.service';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  public movies: Movie[] = [];

  constructor(
    public alertCtrl: AlertController,
    public loadingCtrl: LoadingController,
    public movieService: MovieService,
    public navCtrl: NavController
  ) { }

  ionViewDidLoad() {
    this.movieService.getAll()
      .then((movies: Movie[]) => {
        this.movies = movies
      })
  }

  public onSave(type: string, item?: ItemSliding, movie?: Movie): void {
    let title: string = type.charAt(0).toUpperCase() + type.substr(1);
    this.showAlert({
      itemSliding: item,
      title: `${title} Filme`,
      type: type,
      movie: movie
    })
  }

  public onDelete(movie: Movie): void {
    this.alertCtrl.create({
      title: `Você deseja deletar o filme ${movie.title}?`,
      buttons: [
        {
          text: 'Sim',
          handler: () => {
            let loading: Loading = this.showLoading(`Deletando ${movie.title}...`);

            this.movieService.delete(movie.id)
              .then((deleted: boolean) => {
                if (deleted) {
                  this.movies.splice(this.movies.indexOf(movie), 1)
                }
                loading.dismiss();
              })
          }
        },
        'Não'
      ]
    })
  }

  public showAlert(options: { itemSliding?: ItemSliding, title: string, type: string, movie?: Movie }): void {
    let alertOptions: AlertOptions = {
      title: options.title,
      inputs: [
        {
          name: 'title',
          placeholder: 'titulo do filme'
        }
      ],
      buttons: [
        'Cancelar',
        {
          text: 'Salvar',
          handler: (data) => {
            let loading: Loading = this.showLoading(`Salvando ${data.title} filme`);
            let contextMovie: Movie;

            switch (options.type) {
              case 'create':
                contextMovie = new Movie(data.title);
                break;
              case 'update':
                options.movie.title = data.title;
                contextMovie = options.movie;
                break;
            }

            this.movieService[options.type](contextMovie)
              .then((result: any) => {
                if (options.type === 'create') this.movies.unshift(result);
                loading.dismiss();
                if (options.itemSliding) options.itemSliding.close();
              })
          }
        }
      ]
    };

    if (options.type === 'update') {
      alertOptions.inputs[0]['value'] = options.movie.title;
    }
    this.alertCtrl.create(alertOptions).present();
  }

  private showLoading(message?: string): Loading {
    let loading: Loading = this.loadingCtrl.create({
      content: message || 'Aguarde...'
    });
    loading.present();
    return loading;
  }

}
