import { Controller, Get, Patch, Query, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import {
  ApiBearerAuth,
  ApiExtraModels,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import ApiBaseResponses from '@decorators/api-base-response.decorator';
import {
  AccessGuard,
  Actions,
  CaslConditions,
  CaslSubject,
  CaslUser,
  ConditionsProxy,
  SubjectProxy,
  UseAbility,
  UserProxy,
} from '@modules/casl';
import UserEntity from '@modules/user/entities/user.entity';
import Serialize from '@decorators/serialize.decorator';
import { OrderByPipe, WherePipe } from '@nodeteam/nestjs-pipes';
import { Prisma, User } from '@prisma/client';
import { PaginatorTypes } from '@nodeteam/nestjs-prisma-pagination';
import UserBaseEntity from '@modules/user/entities/user-base.entity';
import { UserHook } from '@modules/user/user.hook';
import ApiOkBaseResponse from '@decorators/api-ok-base-response.decorator';
import { UserWithRoles } from './types/user.types';

@ApiTags('Users')
@ApiBearerAuth()
@ApiExtraModels(UserBaseEntity)
@ApiBaseResponses()
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}
  @Get()
  @ApiQuery({ name: 'where', required: false, type: 'string' })
  @ApiQuery({ name: 'orderBy', required: false, type: 'string' })
  @ApiQuery({ name: 'page', required: false, type: 'number' })
  @ApiQuery({ name: 'perPage', required: false, type: 'number' })
  @ApiOkBaseResponse({ dto: UserBaseEntity, isArray: true })
  @UseGuards(AccessGuard)
  @Serialize(UserBaseEntity)
  @UseAbility(Actions.read, UserEntity)
  async findAll(
    @Query('where', WherePipe) where?: Prisma.UserWhereInput,
    @Query('orderBy', OrderByPipe)
    orderBy?: Prisma.UserOrderByWithRelationInput,
    @Query('page') page?: number,
    @Query('perPage') perPage?: number, 
  ): Promise<PaginatorTypes.PaginatedResult<User>> {
    return this.userService.findAll(where, orderBy, page, perPage); // Pass page and perPage to service method
  }

  @Get('me')
  @ApiOkBaseResponse({ dto: UserBaseEntity })
  @UseGuards(AccessGuard)
  @Serialize(UserBaseEntity)
  @UseAbility(Actions.read, UserEntity)
  async me(
    @CaslUser() userProxy?: UserProxy<UserWithRoles>,
  ): Promise<UserEntity> {
    const tokenUser = await userProxy.get();

    return this.userService.findOne(tokenUser.id);
  }

  @Patch('me')
  @UseGuards(AccessGuard)
  @Serialize(UserBaseEntity)
  @UseAbility(Actions.update, UserEntity, UserHook)
  async updateUser(
    @CaslUser() userProxy?: UserProxy<UserWithRoles>,
    @CaslConditions() conditions?: ConditionsProxy,
    @CaslSubject() subjectProxy?: SubjectProxy<User>,
  ): Promise<User> {
    const tokenUser = await userProxy.get();
    const subject = await subjectProxy.get();

    console.log(tokenUser);
    console.log(subject);
    console.log(conditions.toSql());

    return subject;
  }
}
