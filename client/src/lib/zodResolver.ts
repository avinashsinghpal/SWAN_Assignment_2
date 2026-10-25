import { ZodSchema } from 'zod';

export function zodResolver<T extends ZodSchema>(schema: T) {
  return async (values: any) => {
    const result = schema.safeParse(values);
    if (result.success) {
      return {
        values: result.data,
        errors: {},
      };
    }

    const errors: Record<string, { type: string; message: string }> = {};
    result.error.errors.forEach((err) => {
      const field = err.path[0] as string || 'root';
      if (!errors[field]) {
        errors[field] = {
          type: err.code,
          message: err.message,
        };
      }
    });

    return {
      values: {},
      errors,
    };
  };
}
