import { Controller, Get, Delete, Put, Body, Req, Post, UseGuards, HttpStatus, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { BasicAuthGuard, JwtAuthGuard } from '../auth';
import { Order, OrderService } from '../order';
import { AppRequest, getUserIdFromRequest } from '../shared';
import { calculateCartTotal } from './models-rules';
import { CartService } from './services';
import { UpdateUserCartDTO } from './dto/update-user-cart.dto';
import { CartStatus } from './models';

@Controller('api/profile/cart')
export class CartController {
  constructor(
    private cartService: CartService,
    private orderService: OrderService
  ) { }

  // @UseGuards(JwtAuthGuard)
  @UseGuards(BasicAuthGuard)
  @Get()
  async findUserCart(@Req() req: AppRequest) {
    const cart = await this.cartService.findOrCreateByUserId(getUserIdFromRequest(req));

    return {
      statusCode: HttpStatus.OK,
      message: 'OK',
      data: { 
        cart, 
        total: calculateCartTotal(cart) },
    }
  }

  // @UseGuards(JwtAuthGuard)
  @UseGuards(BasicAuthGuard)
  @Put()
  async updateUserCart(@Req() req: AppRequest, @Body() updateUserCartDTO: UpdateUserCartDTO) { // TODO: validate body payload...
    const cart = await this.cartService.updateByUserId(getUserIdFromRequest(req), updateUserCartDTO)

    return {
      statusCode: HttpStatus.OK,
      message: 'OK',
      data: {
        cart,
        total: calculateCartTotal(cart),
      }
    }
  }

  // @UseGuards(JwtAuthGuard)
  @UseGuards(BasicAuthGuard)
  @Delete()
  clearUserCart(@Req() req: AppRequest) {
    console.log('delete', req);
    this.cartService.removeByUserId(getUserIdFromRequest(req));

    return {
      statusCode: HttpStatus.OK,
      message: 'OK',
    }
  }

  // @UseGuards(JwtAuthGuard)
  @UseGuards(BasicAuthGuard)
  @Post('checkout')
  async checkout(@Req() req: AppRequest, @Body() body) {
    const userId = getUserIdFromRequest(req);
    const cart = await this.cartService.findByUserId(userId);

    if (!(cart && cart.items.length)) {
      const statusCode = HttpStatus.BAD_REQUEST;
      req.statusCode = statusCode

      return {
        statusCode,
        message: 'Cart is empty',
      }
    }

    const { id: cartId, items } = cart;
    const total = calculateCartTotal(cart);
    let trx;
    let order: Order;
    let cartStatus: string;

    try {
      trx = await this.cartService.createTransaction();
      order = this.orderService.create({
        ...body, // TODO: validate and pick only necessary data
        userId,
        cartId,
        items,
        total,
      });
      const [{ status }] = await this.cartService.changeCartStatusTransacted(trx, cartId);
      await trx.commit();
      cartStatus = status;
    } catch (error) {
      await trx.rollback();
      
      throw new InternalServerErrorException(`Transaction failed and rolled back: ${error}`);
    } 

    return {
      statusCode: HttpStatus.OK,
      message: 'OK',
      data: { 
        cart_status: cartStatus,
        order 
      }
    }
  }
}

