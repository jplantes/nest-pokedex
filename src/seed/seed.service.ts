import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import axios, { AxiosInstance } from 'axios';
import { Model } from 'mongoose';

import { Pokemon } from 'src/pokemon/entities/pokemon.entity';

import { PokeResults } from './interfaces/poke-response.interface';
import { AxiosAdapter } from 'src/common/adapters/axios.adapter';

@Injectable()
export class SeedService {

  constructor(
    @InjectModel( Pokemon.name )
    private readonly pokemonModel: Model<Pokemon>,

    private readonly http: AxiosAdapter,
  ){}

  



  // Esta es la forma optima para inserción masiva
  async correrSeed() {
    await this.pokemonModel.deleteMany({});

    const data = await this.http.get<PokeResults>('https://pokeapi.co/api/v2/pokemon?limit=650');

    const pokemonToInsert: { name: string, no: number }[] = [];

    data.results.forEach( ({ name, url}) => {
      const numero =  url.split('/');
      pokemonToInsert.push( { name, no: +numero[numero.length - 2] } );
    });

    await this.pokemonModel.insertMany( pokemonToInsert );

    return 'Seed ejecutado';
  }

// Esta es otra forma de inserción masiva (no es la mas optima)
//  async correrSeed() {
//    await this.pokemonModel.deleteMany({});
//
//    const { data } = await this.axios.get<PokeResults>('https://pokeapi.co/api/v2/pokemon?limit=650');
//
//    const inserPromisesArray = [];
//
//    data.results.forEach( ({ name, url}) => {
//      const numero =  url.split('/');
//      inserPromisesArray.push( this.pokemonModel.create( { name, no: +numero[numero.length - 2] } ) );
//    });
//
//    await Promise.all( inserPromisesArray );
//
//    return 'Seed ejecutado';
//  }

}
