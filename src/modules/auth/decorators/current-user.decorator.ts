import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User } from '../../../entities/user.entity';


export const CurrentUser = createParamDecorator(
    (data: keyof User | undefined, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest();
        const user = request.user as User;

        // If a specific property is requested, return just that property
        if (data) {
            return user?.[data];
        }

        // Otherwise return the entire user object
        return user;
    },
);
