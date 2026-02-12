import * as bcrypt from 'bcryptjs';

export class HashUtil {
    private static readonly SALT_ROUNDS = 12;

    /**
     * Hash a plain text string (e.g. password)
     */
    static async hash(text: string): Promise<string> {
        return bcrypt.hash(text, this.SALT_ROUNDS);
    }

    /**
     * Compare a plain text string with a hash
     */
    static async compare(text: string, hash: string): Promise<boolean> {
        return bcrypt.compare(text, hash);
    }
}
