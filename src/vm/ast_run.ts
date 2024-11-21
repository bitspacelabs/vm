import * as esprima from 'esprima'
import { PUBLIC_NAME } from '../constant';



type OP = '<' | '<=' | '>' | '>=' | '==' | '==='

class Environment {
    variables: any;
    outer: any;
    constructor(outer = null) {
        this.variables = {};
        this.outer = outer;
    }

    get(name: string) {
        if (name in this.variables) {
            return this.variables[name];
        } else if (this.outer !== null) {
            return this.outer.get(name);
        } else {
            throw new ReferenceError(`Variable "${name}" is not defined.`);
        }
    }

    set(name: string, value: any) {
        this.variables[name] = value;
        this.outer[name] = value;
    }

    define(name: string, value: any) {
        this.variables[name] = value;
    }
}

class Interpreter {
    globalEnv: Environment;
    currentEnv: Environment;
    gas: any;
    runIndex: number;
    update_log: any;
    constructor(gas: number) {
        this.globalEnv = new Environment();
        this.currentEnv = this.globalEnv;
        this.gas = gas;
        this.runIndex = 0;
        this.update_log = {};
    }

    interpret(node: any): any {
        this.runIndex++;
        if(this.runIndex > this.gas){
            return
        }
        switch (node.type) {
            // ArrayExpression
            case 'Program':
                return this.interpretProgram(node);
            case 'VariableDeclaration':
                return this.interpretVariableDeclaration(node);
            case 'ObjectExpression':
                return this.interpretObjectExpression(node);
            case 'FunctionDeclaration':
                return this.interpretFunctionDeclaration(node);
            case 'ExpressionStatement':
                return this.interpret(node.expression);
            case 'BlockStatement':
                return this.interpretBlockStatement(node);
            case 'AssignmentExpression':
                return this.interpretAssignmentExpression(node);
            case 'BinaryExpression':
                return this.interpretBinaryExpression(node);
            case 'Literal':
                return node.value;
            case 'MemberExpression':
                return this.interpretMemberExpression(node);
            case 'ArrayExpression':
                return node.elements.map((e: any) => e.value);
            case 'Identifier':
                return this.currentEnv.get(node.name);
            case 'CallExpression':
                return this.interpretCallExpression(node);
            case 'ReturnStatement':
                return this.interpretReturnStatement(node);
            case 'WhileStatement':
                return this.interpretWhileStatement(node);
            case 'IfStatement':
                return this.interpretIfStatement(node);
            case 'UpdateExpression':
                return this.interpretUpdateExpression(node);
            case 'UnaryExpression':
                return this.interpretUnaryExpression(node);
            default:
                throw new Error(`Unknown node type: ${node.type}`);
        }
    }

    interpretProgram(node: any): any {
        for (const statement of node.body) {
            this.interpret(statement);
        }
    }

    interpretVariableDeclaration(node: any): any {
        for (const declaration of node.declarations) {
            const name = declaration.id.name;
            const value = declaration.init ? this.interpret(declaration.init) : undefined;

            console.log('VariableDeclaration', name, value)
            this.currentEnv.define(name, value);
            this.update_log[name] = value
        }
    }

    
    // TODO
    // interpretObjectExpression:: ObjectExpression { type: 'ObjectExpression', properties: [] }

    interpretObjectExpression(node: any): any{
        console.log('interpretObjectExpression::', node.properties)
        let obj: any = {}
        for (const propertie of node.properties) {
            if(propertie.type === 'Property'){
                // TODO value
                obj[propertie.key.name] = propertie.value.value
            }
        }
        return obj
    }

    interpretFunctionDeclaration(node: any): any {
        const name = node.id.name;
        this.currentEnv.define(name, node);
    }

    interpretBlockStatement(node: any): any {
        for (const statement of node.body) {
            const result = this.interpret(statement);
            if (statement.type === 'ReturnStatement') {
                return result;
            }
        }
    }

    operators = {
        '<': (a: any, b: any) => a < b,
        '<=': (a: any, b: any) => a <= b,
        '>': (a: any, b: any) => a > b,
        '>=': (a: any, b: any) => a >= b,
        '==': (a: any, b: any) => a == b,
        '!=': (a: any, b: any) => a != b,
        '===': (a: any, b: any) => a === b,
        '!==': (a: any, b: any) => a !== b,
    }
    
    
    interpretWhileStatement(node: any){
        
        const { left, right, operator } = node.test;
        while(this.operators[operator as OP](this.currentEnv.get(left.name), right.value)){
            this.runIndex++;
            if(this.runIndex > this.gas){
                return
            }
            for (const statement of node.body.body) {
                this.interpret(statement);
            }
        }
    }

    interpretUnaryExpression(node: any){
        if(node.operator === 'typeof' && node.prefix){
            return typeof this.interpret(node.argument)
        }
        if(node.operator === '-' && node.prefix){
            return -this.interpret(node.argument)
        }
    }

    interpretIfStatement(node: any){
        const { left, right, operator } = node.test;
        let l = this.interpret(left)
        // console.log('left', left, right, l)
        if(this.operators[operator as OP](l, this.interpret(right))){
            this.interpret(node.consequent);
        }else if(node.alternate){
            this.interpret(node.alternate)
        }
    }

    interpretUpdateExpression(node: any){
        // console.log('UpdateExpression::')
        // const left = this.interpret(node.left);
        // const right = this.interpret(node.right);
        // console.log(node, node.operator, this.currentEnv.get(node.argument.name))
        const _name = node.argument.name
        const updateVal = this.currentEnv.get(_name) + 1
        this.currentEnv.set(node.argument.name, updateVal)
        this.update_log[_name] = {
            type: 'update',
            value: updateVal,
        }
        return updateVal
    }

    interpretAssignmentExpression(node: any) {
        const name = node.left.name;
        if(name){
            let value = this.interpret(node.right);
            this.currentEnv.set(name, value);
            this.currentEnv.get(name)
            console.log('push::')
            this.update_log[name] = value
        }else{
            const name = node?.left?.object?.name
            const key = this.interpret(node?.left?.property)

            if(name && key){            
                const value = this.interpret(node.right);
                const newObj = this.currentEnv.get(name)
                this.currentEnv.set(name, {...newObj, [key]: value});
                this.update_log[name] = {
                    key,
                    value,
                }
            }
        }
    }

    interpretMemberExpression(node: any) {
        const obj = this.interpret(node.object)
        // console.log(JSON.stringify(node))
        const key = node?.computed ? this.interpret(node.property) : node.property.name
        // console.log(obj, key,)
        return obj[key]
    }

    interpretBinaryExpression(node: any) {
        const left = this.interpret(node.left);
        const right = this.interpret(node.right);

        console.log('interpretBinaryExpression', left, right)
        switch (node.operator) {
            case '+':
                return left + right;
            case '-':
                return left - right;
            case '*':
                return left * right;
            case '/':
                return left / right;
            case '%':
                return left % right;
            default:
                throw new Error(`Unknown binary operator: ${node.operator}`);
        }
    }

    interpretCallExpression(node: any) {
        // console.log('node::', node)
        
        const calleeName = node.callee.name || node.callee.object.name
        // console.log('node.callee.name::', calleeName)
        const propertyName = node.callee?.property?.name || node.callee?.property?.name
        const func = this.currentEnv.get(calleeName);


        // console.log('func::', func)
        const args = node.arguments.map((arg: any) => this.interpret(arg));

        // console.log('args::', args)
        const funcEnv = new Environment(this.currentEnv as any);

        switch(func.type){
            case 'FunctionDeclaration':{
                for (let i = 0; i < func.params.length; i++) {
                    funcEnv.define(func.params[i].name, args[i]);
                }
                
                const interpreter = new Interpreter(this.gas);
                interpreter.currentEnv = funcEnv;
                interpreter.runIndex = this.runIndex
                interpreter.update_log = this.update_log

                return interpreter.interpret(func.body);
            }
            case void 0:{
                if(typeof func === 'object'){
                    return func[propertyName](...args)
                }
            }
        }

    }

    interpretReturnStatement(node: any) {
        return this.interpret(node.argument);
    }
}



export function ast_run(gas: number, code: string | any, keys: string[], values: string[]){
    
    // TODO check code
    const ast = typeof code === 'string' ? esprima.parseScript(code) : code

    const interpreter = new Interpreter(gas);

    let i = 0
    for (const key of keys) {
        interpreter.currentEnv.define(key, values[i])
        i++
    }
    interpreter.interpret(ast);
    
    return interpreter 
}


export function Jsvm({ gas, contract: code, callName, params, transactionKeys: keys, transactionInfo: values }: {gas: number, contract: string, params: Array<string | number>, callName: string, transactionKeys: string[], transactionInfo: any[]}){
    const res = ast_run(gas, code, keys, values)

    const callFuncName = PUBLIC_NAME + callName

    const ast = res.currentEnv.variables[callFuncName]

    // console.log(JSON.stringify(ast))
    if(!ast){
        return
    }
    
    let args: any = []
    if(params.length !== 0){
        for (const arg of params) {
            if(typeof arg !== 'string' && typeof arg !== 'number'){
                return
            }
        }
    
        const testBody = esprima.parseScript('t'+ '(' + params.join(',') + ')').body[0]
        if(testBody.type === 'ExpressionStatement'){
            if(testBody.expression.type === 'CallExpression'){            
                args = testBody.expression.arguments
            }
        }
    }

    const content = esprima.parseScript(code).body
    .filter(item => {
        if(item.type === 'FunctionDeclaration' && item.id.type === 'Identifier' && item.id.name === callFuncName){
            return true
        }
        if(item.type === 'FunctionDeclaration' && item.id.type === 'Identifier' && item.id.name.startsWith(PUBLIC_NAME)){
            return false
        }
        return true
    })

    // console.log('content::', JSON.stringify(content))

    const body = [
        ...content,
        {
            type: "ExpressionStatement",
            expression: {
                type: "CallExpression",
                callee: {
                    "type": "Identifier",
                    "name": callFuncName
                },
                arguments: args
            }
        }
    ]
    const res2 = ast_run(gas, {type: 'Program', body}, keys, values)
    return res2
}
