import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model, isValidObjectId } from 'mongoose';

import { Pokemon } from './entities/pokemon.entity';

import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';

@Injectable()
export class PokemonService {

  private defaultLimit: number;

  constructor(
    @InjectModel( Pokemon.name )
    private readonly pokemonModel: Model<Pokemon>,

    private readonly configService: ConfigService,
  ){
    this.defaultLimit = this.configService.get<number>('defaultLimit')
  }

  async create(createPokemonDto: CreatePokemonDto) {
    createPokemonDto.name = createPokemonDto.name.toLocaleLowerCase();

    try {
      const pokemon = await this.pokemonModel.create( createPokemonDto );
      return pokemon;
    } catch (error) {
      this.handleExeptions( error );
    }
  }

  findAll( paginationDto: PaginationDto ) {

    const { limit = this.defaultLimit, offset = 10 } = paginationDto;
    
    return this.pokemonModel.find()
          .limit( limit )
          .skip( offset )
          .sort({
            no: 1
          })
          .select('-__v');
  }

  async findOne(term: string) {
    let pokemon: Pokemon;

    if( !isNaN( +term ) ){
      pokemon = await this.pokemonModel.findOne({ no: term });
    }

    // Mongo ID
    if ( !pokemon && isValidObjectId( term ) ) {
      pokemon = await this.pokemonModel.findById( term );
    }

    // Nombre
    if( !pokemon ) {
      pokemon = await this.pokemonModel.findOne({ name: term.toLowerCase().trim() });
    }


    if ( !pokemon ) throw new NotFoundException( `El Pokemon por Id, nombre o número '${ term }' no existe` );

    return pokemon;
  }

  async update(term: string, updatePokemonDto: UpdatePokemonDto) {

    const pokemon = await this.findOne( term )

    if ( updatePokemonDto.name ) updatePokemonDto.name = updatePokemonDto.name.toLowerCase();

    try {
      await pokemon.updateOne( updatePokemonDto )
  
      return {
        ...pokemon.toJSON(),
        ...updatePokemonDto
      };
    } catch (error) {
      this.handleExeptions( error );
    }
  }

  async remove(id: string) {
    // const pokemon = await this.findOne( id );
    // await pokemon.deleteOne();

    // Con el Pipe
    //await this.pokemonModel.findByIdAndDelete( id );

    const { deletedCount } = await this.pokemonModel.deleteOne({ _id: id });

    if ( deletedCount === 0 ) throw new BadRequestException(`El ID ${ id } no existe`);
  }



  private handleExeptions( error: any ) {
    if( error.code === 11000 ) {
      throw new BadRequestException(`Pokemon ya existe en la BBDD: '${JSON.stringify( error.keyValue )}' `)
    }

    throw new InternalServerErrorException('Error al crear el Pokemon, por favor revise los logs');
  }
}
