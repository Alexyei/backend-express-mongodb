export default class ApiError extends Error {
    status;
    errors;

    constructor(status: number, message: string, errors:any[] = []) {
        super(message);
        this.status = status;
        this.errors = errors;
        // Расскомментировать если в tsconfig.json используется es5
        // В es5 без этой строки выражение: ApiError.BadRequest("abc") instanceof ApiError будет давать false, что является неверным
        // В es6 будет давать true
        // Object.setPrototypeOf(this, ApiError.prototype);
    }

    static BadRequest(message:string, errors:any[] = []) {
        return new ApiError(400, message, errors);
    }
}