import type { Static } from '@feathersjs/typebox';
import type { HookContext } from '../../declarations';
import type { UserService } from './users.class';
export declare const userSchema: import("@sinclair/typebox").TObject<{
    id: import("@sinclair/typebox").TNumber;
    first_name: import("@sinclair/typebox").TString<string>;
    last_name: import("@sinclair/typebox").TString<string>;
    phone_number: import("@sinclair/typebox").TString<string>;
    pin: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString<string>>;
    role: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TNumber>;
    merchant_id: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString<string>>;
    email: import("@sinclair/typebox").TString<string>;
    password: import("@sinclair/typebox").TString<string>;
    is_logged_in: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TBoolean>;
    is_verified: import("@sinclair/typebox").TBoolean;
    address: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString<string>>;
    local_government_area: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString<string>>;
    state: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString<string>>;
    one_signal_player_id: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString<string>>;
    otp: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TNumber>;
}>;
export type User = Static<typeof userSchema>;
export declare const userValidator: import("@feathersjs/schema").Validator<any, any>;
export declare const userResolver: import("@feathersjs/schema").Resolver<{
    state?: string | undefined;
    address?: string | undefined;
    role?: number | undefined;
    pin?: string | undefined;
    merchant_id?: string | undefined;
    is_logged_in?: boolean | undefined;
    local_government_area?: string | undefined;
    one_signal_player_id?: string | undefined;
    otp?: number | undefined;
    id: number;
    email: string;
    first_name: string;
    last_name: string;
    phone_number: string;
    password: string;
    is_verified: boolean;
}, HookContext<UserService<import("./users.class").UserParams>>>;
export declare const userExternalResolver: import("@feathersjs/schema").Resolver<{
    state?: string | undefined;
    address?: string | undefined;
    role?: number | undefined;
    pin?: string | undefined;
    merchant_id?: string | undefined;
    is_logged_in?: boolean | undefined;
    local_government_area?: string | undefined;
    one_signal_player_id?: string | undefined;
    otp?: number | undefined;
    id: number;
    email: string;
    first_name: string;
    last_name: string;
    phone_number: string;
    password: string;
    is_verified: boolean;
}, HookContext<UserService<import("./users.class").UserParams>>>;
export declare const userDataSchema: import("@sinclair/typebox").TPick<import("@sinclair/typebox").TObject<{
    id: import("@sinclair/typebox").TNumber;
    first_name: import("@sinclair/typebox").TString<string>;
    last_name: import("@sinclair/typebox").TString<string>;
    phone_number: import("@sinclair/typebox").TString<string>;
    pin: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString<string>>;
    role: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TNumber>;
    merchant_id: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString<string>>;
    email: import("@sinclair/typebox").TString<string>;
    password: import("@sinclair/typebox").TString<string>;
    is_logged_in: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TBoolean>;
    is_verified: import("@sinclair/typebox").TBoolean;
    address: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString<string>>;
    local_government_area: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString<string>>;
    state: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString<string>>;
    one_signal_player_id: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString<string>>;
    otp: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TNumber>;
}>, ["email", "password", "first_name", "last_name", "pin", "phone_number", "role", "merchant_id", "state", "local_government_area", "address", "is_logged_in", "is_verified", "one_signal_player_id", "otp"]>;
export type UserData = Static<typeof userDataSchema>;
export declare const userDataValidator: import("@feathersjs/schema").Validator<any, any>;
export declare const userDataResolver: import("@feathersjs/schema").Resolver<{
    state?: string | undefined;
    address?: string | undefined;
    role?: number | undefined;
    pin?: string | undefined;
    merchant_id?: string | undefined;
    is_logged_in?: boolean | undefined;
    local_government_area?: string | undefined;
    one_signal_player_id?: string | undefined;
    otp?: number | undefined;
    id: number;
    email: string;
    first_name: string;
    last_name: string;
    phone_number: string;
    password: string;
    is_verified: boolean;
}, HookContext<UserService<import("./users.class").UserParams>>>;
export declare const userPatchSchema: import("@sinclair/typebox").TPartial<import("@sinclair/typebox").TObject<{
    id: import("@sinclair/typebox").TNumber;
    first_name: import("@sinclair/typebox").TString<string>;
    last_name: import("@sinclair/typebox").TString<string>;
    phone_number: import("@sinclair/typebox").TString<string>;
    pin: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString<string>>;
    role: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TNumber>;
    merchant_id: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString<string>>;
    email: import("@sinclair/typebox").TString<string>;
    password: import("@sinclair/typebox").TString<string>;
    is_logged_in: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TBoolean>;
    is_verified: import("@sinclair/typebox").TBoolean;
    address: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString<string>>;
    local_government_area: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString<string>>;
    state: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString<string>>;
    one_signal_player_id: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString<string>>;
    otp: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TNumber>;
}>>;
export type UserPatch = Static<typeof userPatchSchema>;
export declare const userPatchValidator: import("@feathersjs/schema").Validator<any, any>;
export declare const userPatchResolver: import("@feathersjs/schema").Resolver<{
    state?: string | undefined;
    address?: string | undefined;
    role?: number | undefined;
    pin?: string | undefined;
    merchant_id?: string | undefined;
    is_logged_in?: boolean | undefined;
    local_government_area?: string | undefined;
    one_signal_player_id?: string | undefined;
    otp?: number | undefined;
    id: number;
    email: string;
    first_name: string;
    last_name: string;
    phone_number: string;
    password: string;
    is_verified: boolean;
}, HookContext<UserService<import("./users.class").UserParams>>>;
export declare const userQueryProperties: import("@sinclair/typebox").TPick<import("@sinclair/typebox").TObject<{
    id: import("@sinclair/typebox").TNumber;
    first_name: import("@sinclair/typebox").TString<string>;
    last_name: import("@sinclair/typebox").TString<string>;
    phone_number: import("@sinclair/typebox").TString<string>;
    pin: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString<string>>;
    role: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TNumber>;
    merchant_id: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString<string>>;
    email: import("@sinclair/typebox").TString<string>;
    password: import("@sinclair/typebox").TString<string>;
    is_logged_in: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TBoolean>;
    is_verified: import("@sinclair/typebox").TBoolean;
    address: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString<string>>;
    local_government_area: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString<string>>;
    state: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString<string>>;
    one_signal_player_id: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString<string>>;
    otp: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TNumber>;
}>, ["id", "email", "role", "merchant_id", "first_name", "last_name", "is_logged_in", "is_verified"]>;
export declare const userQuerySchema: import("@sinclair/typebox").TIntersect<[import("@sinclair/typebox").TIntersect<[import("@sinclair/typebox").TPartial<import("@sinclair/typebox").TObject<{
    $limit: import("@sinclair/typebox").TNumber;
    $skip: import("@sinclair/typebox").TNumber;
    $sort: import("@sinclair/typebox").TObject<{
        id: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TInteger>;
        role: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TInteger>;
        email: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TInteger>;
        first_name: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TInteger>;
        last_name: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TInteger>;
        merchant_id: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TInteger>;
        is_logged_in: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TInteger>;
        is_verified: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TInteger>;
    }>;
    $select: import("@sinclair/typebox").TUnsafe<("id" | "role" | "email" | "first_name" | "last_name" | "merchant_id" | "is_logged_in" | "is_verified")[]>;
    $and: import("@sinclair/typebox").TArray<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TObject<{
        id: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TNumber, import("@sinclair/typebox").TPartial<import("@sinclair/typebox").TIntersect<[import("@sinclair/typebox").TObject<{
            $gt: import("@sinclair/typebox").TNumber;
            $gte: import("@sinclair/typebox").TNumber;
            $lt: import("@sinclair/typebox").TNumber;
            $lte: import("@sinclair/typebox").TNumber;
            $ne: import("@sinclair/typebox").TNumber;
            $in: import("@sinclair/typebox").TNumber | import("@sinclair/typebox").TArray<import("@sinclair/typebox").TNumber>;
            $nin: import("@sinclair/typebox").TNumber | import("@sinclair/typebox").TArray<import("@sinclair/typebox").TNumber>;
        }>, import("@sinclair/typebox").TObject<{
            [key: string]: import("@sinclair/typebox").TSchema;
        } | undefined>]>>]>>;
        role: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TNumber>, import("@sinclair/typebox").TPartial<import("@sinclair/typebox").TIntersect<[import("@sinclair/typebox").TObject<{
            $gt: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TNumber>;
            $gte: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TNumber>;
            $lt: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TNumber>;
            $lte: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TNumber>;
            $ne: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TNumber>;
            $in: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TNumber> | import("@sinclair/typebox").TArray<import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TNumber>>;
            $nin: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TNumber> | import("@sinclair/typebox").TArray<import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TNumber>>;
        }>, import("@sinclair/typebox").TObject<{
            [key: string]: import("@sinclair/typebox").TSchema;
        } | undefined>]>>]>>;
        email: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString<string>, import("@sinclair/typebox").TPartial<import("@sinclair/typebox").TIntersect<[import("@sinclair/typebox").TObject<{
            $gt: import("@sinclair/typebox").TString<string>;
            $gte: import("@sinclair/typebox").TString<string>;
            $lt: import("@sinclair/typebox").TString<string>;
            $lte: import("@sinclair/typebox").TString<string>;
            $ne: import("@sinclair/typebox").TString<string>;
            $in: import("@sinclair/typebox").TString<string> | import("@sinclair/typebox").TArray<import("@sinclair/typebox").TString<string>>;
            $nin: import("@sinclair/typebox").TString<string> | import("@sinclair/typebox").TArray<import("@sinclair/typebox").TString<string>>;
        }>, import("@sinclair/typebox").TObject<{
            [key: string]: import("@sinclair/typebox").TSchema;
        } | undefined>]>>]>>;
        first_name: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString<string>, import("@sinclair/typebox").TPartial<import("@sinclair/typebox").TIntersect<[import("@sinclair/typebox").TObject<{
            $gt: import("@sinclair/typebox").TString<string>;
            $gte: import("@sinclair/typebox").TString<string>;
            $lt: import("@sinclair/typebox").TString<string>;
            $lte: import("@sinclair/typebox").TString<string>;
            $ne: import("@sinclair/typebox").TString<string>;
            $in: import("@sinclair/typebox").TString<string> | import("@sinclair/typebox").TArray<import("@sinclair/typebox").TString<string>>;
            $nin: import("@sinclair/typebox").TString<string> | import("@sinclair/typebox").TArray<import("@sinclair/typebox").TString<string>>;
        }>, import("@sinclair/typebox").TObject<{
            [key: string]: import("@sinclair/typebox").TSchema;
        } | undefined>]>>]>>;
        last_name: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString<string>, import("@sinclair/typebox").TPartial<import("@sinclair/typebox").TIntersect<[import("@sinclair/typebox").TObject<{
            $gt: import("@sinclair/typebox").TString<string>;
            $gte: import("@sinclair/typebox").TString<string>;
            $lt: import("@sinclair/typebox").TString<string>;
            $lte: import("@sinclair/typebox").TString<string>;
            $ne: import("@sinclair/typebox").TString<string>;
            $in: import("@sinclair/typebox").TString<string> | import("@sinclair/typebox").TArray<import("@sinclair/typebox").TString<string>>;
            $nin: import("@sinclair/typebox").TString<string> | import("@sinclair/typebox").TArray<import("@sinclair/typebox").TString<string>>;
        }>, import("@sinclair/typebox").TObject<{
            [key: string]: import("@sinclair/typebox").TSchema;
        } | undefined>]>>]>>;
        merchant_id: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString<string>>, import("@sinclair/typebox").TPartial<import("@sinclair/typebox").TIntersect<[import("@sinclair/typebox").TObject<{
            $gt: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString<string>>;
            $gte: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString<string>>;
            $lt: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString<string>>;
            $lte: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString<string>>;
            $ne: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString<string>>;
            $in: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString<string>> | import("@sinclair/typebox").TArray<import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString<string>>>;
            $nin: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString<string>> | import("@sinclair/typebox").TArray<import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString<string>>>;
        }>, import("@sinclair/typebox").TObject<{
            [key: string]: import("@sinclair/typebox").TSchema;
        } | undefined>]>>]>>;
        is_logged_in: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TBoolean>, import("@sinclair/typebox").TPartial<import("@sinclair/typebox").TIntersect<[import("@sinclair/typebox").TObject<{
            $gt: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TBoolean>;
            $gte: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TBoolean>;
            $lt: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TBoolean>;
            $lte: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TBoolean>;
            $ne: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TBoolean>;
            $in: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TBoolean> | import("@sinclair/typebox").TArray<import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TBoolean>>;
            $nin: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TBoolean> | import("@sinclair/typebox").TArray<import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TBoolean>>;
        }>, import("@sinclair/typebox").TObject<{
            [key: string]: import("@sinclair/typebox").TSchema;
        } | undefined>]>>]>>;
        is_verified: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TBoolean, import("@sinclair/typebox").TPartial<import("@sinclair/typebox").TIntersect<[import("@sinclair/typebox").TObject<{
            $gt: import("@sinclair/typebox").TBoolean;
            $gte: import("@sinclair/typebox").TBoolean;
            $lt: import("@sinclair/typebox").TBoolean;
            $lte: import("@sinclair/typebox").TBoolean;
            $ne: import("@sinclair/typebox").TBoolean;
            $in: import("@sinclair/typebox").TBoolean | import("@sinclair/typebox").TArray<import("@sinclair/typebox").TBoolean>;
            $nin: import("@sinclair/typebox").TBoolean | import("@sinclair/typebox").TArray<import("@sinclair/typebox").TBoolean>;
        }>, import("@sinclair/typebox").TObject<{
            [key: string]: import("@sinclair/typebox").TSchema;
        } | undefined>]>>]>>;
    }>>, import("@sinclair/typebox").TObject<{
        $or: import("@sinclair/typebox").TArray<import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TObject<{
            id: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TNumber, import("@sinclair/typebox").TPartial<import("@sinclair/typebox").TIntersect<[import("@sinclair/typebox").TObject<{
                $gt: import("@sinclair/typebox").TNumber;
                $gte: import("@sinclair/typebox").TNumber;
                $lt: import("@sinclair/typebox").TNumber;
                $lte: import("@sinclair/typebox").TNumber;
                $ne: import("@sinclair/typebox").TNumber;
                $in: import("@sinclair/typebox").TNumber | import("@sinclair/typebox").TArray<import("@sinclair/typebox").TNumber>;
                $nin: import("@sinclair/typebox").TNumber | import("@sinclair/typebox").TArray<import("@sinclair/typebox").TNumber>;
            }>, import("@sinclair/typebox").TObject<{
                [key: string]: import("@sinclair/typebox").TSchema;
            } | undefined>]>>]>>;
            role: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TNumber>, import("@sinclair/typebox").TPartial<import("@sinclair/typebox").TIntersect<[import("@sinclair/typebox").TObject<{
                $gt: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TNumber>;
                $gte: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TNumber>;
                $lt: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TNumber>;
                $lte: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TNumber>;
                $ne: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TNumber>;
                $in: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TNumber> | import("@sinclair/typebox").TArray<import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TNumber>>;
                $nin: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TNumber> | import("@sinclair/typebox").TArray<import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TNumber>>;
            }>, import("@sinclair/typebox").TObject<{
                [key: string]: import("@sinclair/typebox").TSchema;
            } | undefined>]>>]>>;
            email: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString<string>, import("@sinclair/typebox").TPartial<import("@sinclair/typebox").TIntersect<[import("@sinclair/typebox").TObject<{
                $gt: import("@sinclair/typebox").TString<string>;
                $gte: import("@sinclair/typebox").TString<string>;
                $lt: import("@sinclair/typebox").TString<string>;
                $lte: import("@sinclair/typebox").TString<string>;
                $ne: import("@sinclair/typebox").TString<string>;
                $in: import("@sinclair/typebox").TString<string> | import("@sinclair/typebox").TArray<import("@sinclair/typebox").TString<string>>;
                $nin: import("@sinclair/typebox").TString<string> | import("@sinclair/typebox").TArray<import("@sinclair/typebox").TString<string>>;
            }>, import("@sinclair/typebox").TObject<{
                [key: string]: import("@sinclair/typebox").TSchema;
            } | undefined>]>>]>>;
            first_name: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString<string>, import("@sinclair/typebox").TPartial<import("@sinclair/typebox").TIntersect<[import("@sinclair/typebox").TObject<{
                $gt: import("@sinclair/typebox").TString<string>;
                $gte: import("@sinclair/typebox").TString<string>;
                $lt: import("@sinclair/typebox").TString<string>;
                $lte: import("@sinclair/typebox").TString<string>;
                $ne: import("@sinclair/typebox").TString<string>;
                $in: import("@sinclair/typebox").TString<string> | import("@sinclair/typebox").TArray<import("@sinclair/typebox").TString<string>>;
                $nin: import("@sinclair/typebox").TString<string> | import("@sinclair/typebox").TArray<import("@sinclair/typebox").TString<string>>;
            }>, import("@sinclair/typebox").TObject<{
                [key: string]: import("@sinclair/typebox").TSchema;
            } | undefined>]>>]>>;
            last_name: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString<string>, import("@sinclair/typebox").TPartial<import("@sinclair/typebox").TIntersect<[import("@sinclair/typebox").TObject<{
                $gt: import("@sinclair/typebox").TString<string>;
                $gte: import("@sinclair/typebox").TString<string>;
                $lt: import("@sinclair/typebox").TString<string>;
                $lte: import("@sinclair/typebox").TString<string>;
                $ne: import("@sinclair/typebox").TString<string>;
                $in: import("@sinclair/typebox").TString<string> | import("@sinclair/typebox").TArray<import("@sinclair/typebox").TString<string>>;
                $nin: import("@sinclair/typebox").TString<string> | import("@sinclair/typebox").TArray<import("@sinclair/typebox").TString<string>>;
            }>, import("@sinclair/typebox").TObject<{
                [key: string]: import("@sinclair/typebox").TSchema;
            } | undefined>]>>]>>;
            merchant_id: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString<string>>, import("@sinclair/typebox").TPartial<import("@sinclair/typebox").TIntersect<[import("@sinclair/typebox").TObject<{
                $gt: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString<string>>;
                $gte: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString<string>>;
                $lt: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString<string>>;
                $lte: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString<string>>;
                $ne: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString<string>>;
                $in: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString<string>> | import("@sinclair/typebox").TArray<import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString<string>>>;
                $nin: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString<string>> | import("@sinclair/typebox").TArray<import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString<string>>>;
            }>, import("@sinclair/typebox").TObject<{
                [key: string]: import("@sinclair/typebox").TSchema;
            } | undefined>]>>]>>;
            is_logged_in: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TBoolean>, import("@sinclair/typebox").TPartial<import("@sinclair/typebox").TIntersect<[import("@sinclair/typebox").TObject<{
                $gt: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TBoolean>;
                $gte: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TBoolean>;
                $lt: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TBoolean>;
                $lte: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TBoolean>;
                $ne: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TBoolean>;
                $in: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TBoolean> | import("@sinclair/typebox").TArray<import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TBoolean>>;
                $nin: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TBoolean> | import("@sinclair/typebox").TArray<import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TBoolean>>;
            }>, import("@sinclair/typebox").TObject<{
                [key: string]: import("@sinclair/typebox").TSchema;
            } | undefined>]>>]>>;
            is_verified: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TBoolean, import("@sinclair/typebox").TPartial<import("@sinclair/typebox").TIntersect<[import("@sinclair/typebox").TObject<{
                $gt: import("@sinclair/typebox").TBoolean;
                $gte: import("@sinclair/typebox").TBoolean;
                $lt: import("@sinclair/typebox").TBoolean;
                $lte: import("@sinclair/typebox").TBoolean;
                $ne: import("@sinclair/typebox").TBoolean;
                $in: import("@sinclair/typebox").TBoolean | import("@sinclair/typebox").TArray<import("@sinclair/typebox").TBoolean>;
                $nin: import("@sinclair/typebox").TBoolean | import("@sinclair/typebox").TArray<import("@sinclair/typebox").TBoolean>;
            }>, import("@sinclair/typebox").TObject<{
                [key: string]: import("@sinclair/typebox").TSchema;
            } | undefined>]>>]>>;
        }>>>;
    }>]>>;
    $or: import("@sinclair/typebox").TArray<import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TObject<{
        id: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TNumber, import("@sinclair/typebox").TPartial<import("@sinclair/typebox").TIntersect<[import("@sinclair/typebox").TObject<{
            $gt: import("@sinclair/typebox").TNumber;
            $gte: import("@sinclair/typebox").TNumber;
            $lt: import("@sinclair/typebox").TNumber;
            $lte: import("@sinclair/typebox").TNumber;
            $ne: import("@sinclair/typebox").TNumber;
            $in: import("@sinclair/typebox").TNumber | import("@sinclair/typebox").TArray<import("@sinclair/typebox").TNumber>;
            $nin: import("@sinclair/typebox").TNumber | import("@sinclair/typebox").TArray<import("@sinclair/typebox").TNumber>;
        }>, import("@sinclair/typebox").TObject<{
            [key: string]: import("@sinclair/typebox").TSchema;
        } | undefined>]>>]>>;
        role: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TNumber>, import("@sinclair/typebox").TPartial<import("@sinclair/typebox").TIntersect<[import("@sinclair/typebox").TObject<{
            $gt: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TNumber>;
            $gte: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TNumber>;
            $lt: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TNumber>;
            $lte: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TNumber>;
            $ne: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TNumber>;
            $in: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TNumber> | import("@sinclair/typebox").TArray<import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TNumber>>;
            $nin: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TNumber> | import("@sinclair/typebox").TArray<import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TNumber>>;
        }>, import("@sinclair/typebox").TObject<{
            [key: string]: import("@sinclair/typebox").TSchema;
        } | undefined>]>>]>>;
        email: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString<string>, import("@sinclair/typebox").TPartial<import("@sinclair/typebox").TIntersect<[import("@sinclair/typebox").TObject<{
            $gt: import("@sinclair/typebox").TString<string>;
            $gte: import("@sinclair/typebox").TString<string>;
            $lt: import("@sinclair/typebox").TString<string>;
            $lte: import("@sinclair/typebox").TString<string>;
            $ne: import("@sinclair/typebox").TString<string>;
            $in: import("@sinclair/typebox").TString<string> | import("@sinclair/typebox").TArray<import("@sinclair/typebox").TString<string>>;
            $nin: import("@sinclair/typebox").TString<string> | import("@sinclair/typebox").TArray<import("@sinclair/typebox").TString<string>>;
        }>, import("@sinclair/typebox").TObject<{
            [key: string]: import("@sinclair/typebox").TSchema;
        } | undefined>]>>]>>;
        first_name: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString<string>, import("@sinclair/typebox").TPartial<import("@sinclair/typebox").TIntersect<[import("@sinclair/typebox").TObject<{
            $gt: import("@sinclair/typebox").TString<string>;
            $gte: import("@sinclair/typebox").TString<string>;
            $lt: import("@sinclair/typebox").TString<string>;
            $lte: import("@sinclair/typebox").TString<string>;
            $ne: import("@sinclair/typebox").TString<string>;
            $in: import("@sinclair/typebox").TString<string> | import("@sinclair/typebox").TArray<import("@sinclair/typebox").TString<string>>;
            $nin: import("@sinclair/typebox").TString<string> | import("@sinclair/typebox").TArray<import("@sinclair/typebox").TString<string>>;
        }>, import("@sinclair/typebox").TObject<{
            [key: string]: import("@sinclair/typebox").TSchema;
        } | undefined>]>>]>>;
        last_name: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString<string>, import("@sinclair/typebox").TPartial<import("@sinclair/typebox").TIntersect<[import("@sinclair/typebox").TObject<{
            $gt: import("@sinclair/typebox").TString<string>;
            $gte: import("@sinclair/typebox").TString<string>;
            $lt: import("@sinclair/typebox").TString<string>;
            $lte: import("@sinclair/typebox").TString<string>;
            $ne: import("@sinclair/typebox").TString<string>;
            $in: import("@sinclair/typebox").TString<string> | import("@sinclair/typebox").TArray<import("@sinclair/typebox").TString<string>>;
            $nin: import("@sinclair/typebox").TString<string> | import("@sinclair/typebox").TArray<import("@sinclair/typebox").TString<string>>;
        }>, import("@sinclair/typebox").TObject<{
            [key: string]: import("@sinclair/typebox").TSchema;
        } | undefined>]>>]>>;
        merchant_id: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString<string>>, import("@sinclair/typebox").TPartial<import("@sinclair/typebox").TIntersect<[import("@sinclair/typebox").TObject<{
            $gt: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString<string>>;
            $gte: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString<string>>;
            $lt: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString<string>>;
            $lte: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString<string>>;
            $ne: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString<string>>;
            $in: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString<string>> | import("@sinclair/typebox").TArray<import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString<string>>>;
            $nin: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString<string>> | import("@sinclair/typebox").TArray<import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString<string>>>;
        }>, import("@sinclair/typebox").TObject<{
            [key: string]: import("@sinclair/typebox").TSchema;
        } | undefined>]>>]>>;
        is_logged_in: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TBoolean>, import("@sinclair/typebox").TPartial<import("@sinclair/typebox").TIntersect<[import("@sinclair/typebox").TObject<{
            $gt: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TBoolean>;
            $gte: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TBoolean>;
            $lt: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TBoolean>;
            $lte: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TBoolean>;
            $ne: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TBoolean>;
            $in: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TBoolean> | import("@sinclair/typebox").TArray<import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TBoolean>>;
            $nin: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TBoolean> | import("@sinclair/typebox").TArray<import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TBoolean>>;
        }>, import("@sinclair/typebox").TObject<{
            [key: string]: import("@sinclair/typebox").TSchema;
        } | undefined>]>>]>>;
        is_verified: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TBoolean, import("@sinclair/typebox").TPartial<import("@sinclair/typebox").TIntersect<[import("@sinclair/typebox").TObject<{
            $gt: import("@sinclair/typebox").TBoolean;
            $gte: import("@sinclair/typebox").TBoolean;
            $lt: import("@sinclair/typebox").TBoolean;
            $lte: import("@sinclair/typebox").TBoolean;
            $ne: import("@sinclair/typebox").TBoolean;
            $in: import("@sinclair/typebox").TBoolean | import("@sinclair/typebox").TArray<import("@sinclair/typebox").TBoolean>;
            $nin: import("@sinclair/typebox").TBoolean | import("@sinclair/typebox").TArray<import("@sinclair/typebox").TBoolean>;
        }>, import("@sinclair/typebox").TObject<{
            [key: string]: import("@sinclair/typebox").TSchema;
        } | undefined>]>>]>>;
    }>>>;
}>>, import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TObject<{
    id: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TNumber, import("@sinclair/typebox").TPartial<import("@sinclair/typebox").TIntersect<[import("@sinclair/typebox").TObject<{
        $gt: import("@sinclair/typebox").TNumber;
        $gte: import("@sinclair/typebox").TNumber;
        $lt: import("@sinclair/typebox").TNumber;
        $lte: import("@sinclair/typebox").TNumber;
        $ne: import("@sinclair/typebox").TNumber;
        $in: import("@sinclair/typebox").TNumber | import("@sinclair/typebox").TArray<import("@sinclair/typebox").TNumber>;
        $nin: import("@sinclair/typebox").TNumber | import("@sinclair/typebox").TArray<import("@sinclair/typebox").TNumber>;
    }>, import("@sinclair/typebox").TObject<{
        [key: string]: import("@sinclair/typebox").TSchema;
    } | undefined>]>>]>>;
    role: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TNumber>, import("@sinclair/typebox").TPartial<import("@sinclair/typebox").TIntersect<[import("@sinclair/typebox").TObject<{
        $gt: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TNumber>;
        $gte: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TNumber>;
        $lt: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TNumber>;
        $lte: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TNumber>;
        $ne: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TNumber>;
        $in: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TNumber> | import("@sinclair/typebox").TArray<import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TNumber>>;
        $nin: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TNumber> | import("@sinclair/typebox").TArray<import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TNumber>>;
    }>, import("@sinclair/typebox").TObject<{
        [key: string]: import("@sinclair/typebox").TSchema;
    } | undefined>]>>]>>;
    email: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString<string>, import("@sinclair/typebox").TPartial<import("@sinclair/typebox").TIntersect<[import("@sinclair/typebox").TObject<{
        $gt: import("@sinclair/typebox").TString<string>;
        $gte: import("@sinclair/typebox").TString<string>;
        $lt: import("@sinclair/typebox").TString<string>;
        $lte: import("@sinclair/typebox").TString<string>;
        $ne: import("@sinclair/typebox").TString<string>;
        $in: import("@sinclair/typebox").TString<string> | import("@sinclair/typebox").TArray<import("@sinclair/typebox").TString<string>>;
        $nin: import("@sinclair/typebox").TString<string> | import("@sinclair/typebox").TArray<import("@sinclair/typebox").TString<string>>;
    }>, import("@sinclair/typebox").TObject<{
        [key: string]: import("@sinclair/typebox").TSchema;
    } | undefined>]>>]>>;
    first_name: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString<string>, import("@sinclair/typebox").TPartial<import("@sinclair/typebox").TIntersect<[import("@sinclair/typebox").TObject<{
        $gt: import("@sinclair/typebox").TString<string>;
        $gte: import("@sinclair/typebox").TString<string>;
        $lt: import("@sinclair/typebox").TString<string>;
        $lte: import("@sinclair/typebox").TString<string>;
        $ne: import("@sinclair/typebox").TString<string>;
        $in: import("@sinclair/typebox").TString<string> | import("@sinclair/typebox").TArray<import("@sinclair/typebox").TString<string>>;
        $nin: import("@sinclair/typebox").TString<string> | import("@sinclair/typebox").TArray<import("@sinclair/typebox").TString<string>>;
    }>, import("@sinclair/typebox").TObject<{
        [key: string]: import("@sinclair/typebox").TSchema;
    } | undefined>]>>]>>;
    last_name: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString<string>, import("@sinclair/typebox").TPartial<import("@sinclair/typebox").TIntersect<[import("@sinclair/typebox").TObject<{
        $gt: import("@sinclair/typebox").TString<string>;
        $gte: import("@sinclair/typebox").TString<string>;
        $lt: import("@sinclair/typebox").TString<string>;
        $lte: import("@sinclair/typebox").TString<string>;
        $ne: import("@sinclair/typebox").TString<string>;
        $in: import("@sinclair/typebox").TString<string> | import("@sinclair/typebox").TArray<import("@sinclair/typebox").TString<string>>;
        $nin: import("@sinclair/typebox").TString<string> | import("@sinclair/typebox").TArray<import("@sinclair/typebox").TString<string>>;
    }>, import("@sinclair/typebox").TObject<{
        [key: string]: import("@sinclair/typebox").TSchema;
    } | undefined>]>>]>>;
    merchant_id: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString<string>>, import("@sinclair/typebox").TPartial<import("@sinclair/typebox").TIntersect<[import("@sinclair/typebox").TObject<{
        $gt: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString<string>>;
        $gte: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString<string>>;
        $lt: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString<string>>;
        $lte: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString<string>>;
        $ne: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString<string>>;
        $in: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString<string>> | import("@sinclair/typebox").TArray<import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString<string>>>;
        $nin: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString<string>> | import("@sinclair/typebox").TArray<import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString<string>>>;
    }>, import("@sinclair/typebox").TObject<{
        [key: string]: import("@sinclair/typebox").TSchema;
    } | undefined>]>>]>>;
    is_logged_in: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TBoolean>, import("@sinclair/typebox").TPartial<import("@sinclair/typebox").TIntersect<[import("@sinclair/typebox").TObject<{
        $gt: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TBoolean>;
        $gte: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TBoolean>;
        $lt: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TBoolean>;
        $lte: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TBoolean>;
        $ne: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TBoolean>;
        $in: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TBoolean> | import("@sinclair/typebox").TArray<import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TBoolean>>;
        $nin: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TBoolean> | import("@sinclair/typebox").TArray<import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TBoolean>>;
    }>, import("@sinclair/typebox").TObject<{
        [key: string]: import("@sinclair/typebox").TSchema;
    } | undefined>]>>]>>;
    is_verified: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TBoolean, import("@sinclair/typebox").TPartial<import("@sinclair/typebox").TIntersect<[import("@sinclair/typebox").TObject<{
        $gt: import("@sinclair/typebox").TBoolean;
        $gte: import("@sinclair/typebox").TBoolean;
        $lt: import("@sinclair/typebox").TBoolean;
        $lte: import("@sinclair/typebox").TBoolean;
        $ne: import("@sinclair/typebox").TBoolean;
        $in: import("@sinclair/typebox").TBoolean | import("@sinclair/typebox").TArray<import("@sinclair/typebox").TBoolean>;
        $nin: import("@sinclair/typebox").TBoolean | import("@sinclair/typebox").TArray<import("@sinclair/typebox").TBoolean>;
    }>, import("@sinclair/typebox").TObject<{
        [key: string]: import("@sinclair/typebox").TSchema;
    } | undefined>]>>]>>;
}>>]>, import("@sinclair/typebox").TObject<{}>]>;
export type UserQuery = Static<typeof userQuerySchema>;
export declare const userQueryValidator: import("@feathersjs/schema").Validator<any, any>;
export declare const userQueryResolver: import("@feathersjs/schema").Resolver<Partial<{
    $limit: number;
    $skip: number;
    $sort: {
        id?: number | undefined;
        role?: number | undefined;
        email?: number | undefined;
        first_name?: number | undefined;
        last_name?: number | undefined;
        merchant_id?: number | undefined;
        is_logged_in?: number | undefined;
        is_verified?: number | undefined;
    };
    $select: ("id" | "role" | "email" | "first_name" | "last_name" | "merchant_id" | "is_logged_in" | "is_verified")[];
    $and: ({
        id?: number | Partial<{
            $gt: number;
            $gte: number;
            $lt: number;
            $lte: number;
            $ne: number;
            $in: number | number[];
            $nin: number | number[];
        } & {}> | undefined;
        role?: number | Partial<{
            $gt?: number | undefined;
            $gte?: number | undefined;
            $lt?: number | undefined;
            $lte?: number | undefined;
            $ne?: number | undefined;
            $in: number | number[];
            $nin: number | number[];
        } & {}> | undefined;
        email?: string | Partial<{
            $gt: string;
            $gte: string;
            $lt: string;
            $lte: string;
            $ne: string;
            $in: string | string[];
            $nin: string | string[];
        } & {}> | undefined;
        first_name?: string | Partial<{
            $gt: string;
            $gte: string;
            $lt: string;
            $lte: string;
            $ne: string;
            $in: string | string[];
            $nin: string | string[];
        } & {}> | undefined;
        last_name?: string | Partial<{
            $gt: string;
            $gte: string;
            $lt: string;
            $lte: string;
            $ne: string;
            $in: string | string[];
            $nin: string | string[];
        } & {}> | undefined;
        merchant_id?: string | Partial<{
            $gt?: string | undefined;
            $gte?: string | undefined;
            $lt?: string | undefined;
            $lte?: string | undefined;
            $ne?: string | undefined;
            $in: string | string[];
            $nin: string | string[];
        } & {}> | undefined;
        is_logged_in?: boolean | Partial<{
            $gt?: boolean | undefined;
            $gte?: boolean | undefined;
            $lt?: boolean | undefined;
            $lte?: boolean | undefined;
            $ne?: boolean | undefined;
            $in: boolean | boolean[];
            $nin: boolean | boolean[];
        } & {}> | undefined;
        is_verified?: boolean | Partial<{
            $gt: boolean;
            $gte: boolean;
            $lt: boolean;
            $lte: boolean;
            $ne: boolean;
            $in: boolean | boolean[];
            $nin: boolean | boolean[];
        } & {}> | undefined;
    } | {
        $or: {
            id?: number | Partial<{
                $gt: number;
                $gte: number;
                $lt: number;
                $lte: number;
                $ne: number;
                $in: number | number[];
                $nin: number | number[];
            } & {}> | undefined;
            role?: number | Partial<{
                $gt?: number | undefined;
                $gte?: number | undefined;
                $lt?: number | undefined;
                $lte?: number | undefined;
                $ne?: number | undefined;
                $in: number | number[];
                $nin: number | number[];
            } & {}> | undefined;
            email?: string | Partial<{
                $gt: string;
                $gte: string;
                $lt: string;
                $lte: string;
                $ne: string;
                $in: string | string[];
                $nin: string | string[];
            } & {}> | undefined;
            first_name?: string | Partial<{
                $gt: string;
                $gte: string;
                $lt: string;
                $lte: string;
                $ne: string;
                $in: string | string[];
                $nin: string | string[];
            } & {}> | undefined;
            last_name?: string | Partial<{
                $gt: string;
                $gte: string;
                $lt: string;
                $lte: string;
                $ne: string;
                $in: string | string[];
                $nin: string | string[];
            } & {}> | undefined;
            merchant_id?: string | Partial<{
                $gt?: string | undefined;
                $gte?: string | undefined;
                $lt?: string | undefined;
                $lte?: string | undefined;
                $ne?: string | undefined;
                $in: string | string[];
                $nin: string | string[];
            } & {}> | undefined;
            is_logged_in?: boolean | Partial<{
                $gt?: boolean | undefined;
                $gte?: boolean | undefined;
                $lt?: boolean | undefined;
                $lte?: boolean | undefined;
                $ne?: boolean | undefined;
                $in: boolean | boolean[];
                $nin: boolean | boolean[];
            } & {}> | undefined;
            is_verified?: boolean | Partial<{
                $gt: boolean;
                $gte: boolean;
                $lt: boolean;
                $lte: boolean;
                $ne: boolean;
                $in: boolean | boolean[];
                $nin: boolean | boolean[];
            } & {}> | undefined;
        }[];
    })[];
    $or: {
        id?: number | Partial<{
            $gt: number;
            $gte: number;
            $lt: number;
            $lte: number;
            $ne: number;
            $in: number | number[];
            $nin: number | number[];
        } & {}> | undefined;
        role?: number | Partial<{
            $gt?: number | undefined;
            $gte?: number | undefined;
            $lt?: number | undefined;
            $lte?: number | undefined;
            $ne?: number | undefined;
            $in: number | number[];
            $nin: number | number[];
        } & {}> | undefined;
        email?: string | Partial<{
            $gt: string;
            $gte: string;
            $lt: string;
            $lte: string;
            $ne: string;
            $in: string | string[];
            $nin: string | string[];
        } & {}> | undefined;
        first_name?: string | Partial<{
            $gt: string;
            $gte: string;
            $lt: string;
            $lte: string;
            $ne: string;
            $in: string | string[];
            $nin: string | string[];
        } & {}> | undefined;
        last_name?: string | Partial<{
            $gt: string;
            $gte: string;
            $lt: string;
            $lte: string;
            $ne: string;
            $in: string | string[];
            $nin: string | string[];
        } & {}> | undefined;
        merchant_id?: string | Partial<{
            $gt?: string | undefined;
            $gte?: string | undefined;
            $lt?: string | undefined;
            $lte?: string | undefined;
            $ne?: string | undefined;
            $in: string | string[];
            $nin: string | string[];
        } & {}> | undefined;
        is_logged_in?: boolean | Partial<{
            $gt?: boolean | undefined;
            $gte?: boolean | undefined;
            $lt?: boolean | undefined;
            $lte?: boolean | undefined;
            $ne?: boolean | undefined;
            $in: boolean | boolean[];
            $nin: boolean | boolean[];
        } & {}> | undefined;
        is_verified?: boolean | Partial<{
            $gt: boolean;
            $gte: boolean;
            $lt: boolean;
            $lte: boolean;
            $ne: boolean;
            $in: boolean | boolean[];
            $nin: boolean | boolean[];
        } & {}> | undefined;
    }[];
}> & {
    id?: number | Partial<{
        $gt: number;
        $gte: number;
        $lt: number;
        $lte: number;
        $ne: number;
        $in: number | number[];
        $nin: number | number[];
    } & {}> | undefined;
    role?: number | Partial<{
        $gt?: number | undefined;
        $gte?: number | undefined;
        $lt?: number | undefined;
        $lte?: number | undefined;
        $ne?: number | undefined;
        $in: number | number[];
        $nin: number | number[];
    } & {}> | undefined;
    email?: string | Partial<{
        $gt: string;
        $gte: string;
        $lt: string;
        $lte: string;
        $ne: string;
        $in: string | string[];
        $nin: string | string[];
    } & {}> | undefined;
    first_name?: string | Partial<{
        $gt: string;
        $gte: string;
        $lt: string;
        $lte: string;
        $ne: string;
        $in: string | string[];
        $nin: string | string[];
    } & {}> | undefined;
    last_name?: string | Partial<{
        $gt: string;
        $gte: string;
        $lt: string;
        $lte: string;
        $ne: string;
        $in: string | string[];
        $nin: string | string[];
    } & {}> | undefined;
    merchant_id?: string | Partial<{
        $gt?: string | undefined;
        $gte?: string | undefined;
        $lt?: string | undefined;
        $lte?: string | undefined;
        $ne?: string | undefined;
        $in: string | string[];
        $nin: string | string[];
    } & {}> | undefined;
    is_logged_in?: boolean | Partial<{
        $gt?: boolean | undefined;
        $gte?: boolean | undefined;
        $lt?: boolean | undefined;
        $lte?: boolean | undefined;
        $ne?: boolean | undefined;
        $in: boolean | boolean[];
        $nin: boolean | boolean[];
    } & {}> | undefined;
    is_verified?: boolean | Partial<{
        $gt: boolean;
        $gte: boolean;
        $lt: boolean;
        $lte: boolean;
        $ne: boolean;
        $in: boolean | boolean[];
        $nin: boolean | boolean[];
    } & {}> | undefined;
} & {}, HookContext<UserService<import("./users.class").UserParams>>>;
