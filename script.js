const Modal = {
    open(){
        //abrir modal
        //adicionar a class ao active modal
        document
        .querySelector('.modal-overlay')
        .classList
        .add('active')
    },
    
    close(){
        //fechar modal
        //remover class active modal
        document
        .querySelector('.modal-overlay')
        .classList
        .remove('active')
    }
}

const Storage = {
    get() {
        return JSON.parse(localStorage.getItem("dev.finances:transactions")) || []
    },

    set(transactions){
        localStorage.setItem("dev.finances:transactions", JSON.stringify(transactions))

    }
}

//logica de adicionar e remover
const Transaction = {
    all: Storage.get(),

    add(transaction){
        Transaction.all.push(transaction)

        App.reload()
    },

    remove(index){
        //vai espelhar a posição do array, e deleta 1 elemento 
        Transaction.all.splice(index, 1)

        App.reload()

    },

    //somar as entradas
    incomes() {
        let income= 0;
        //pegar todas as transações
        //para cada transação,
        Transaction.all.forEach( transaction => {
        //verificar se é maior que 0
            if( transaction.amount > 0) {
            //somar uma variavel e retornar a variavel
            //income = income + transaction.amount;
            income += transaction.amount;
     }   
    })
    
        return income;
    },

    //somar saídas
    expenses() {
        let expense= 0;
        //pegar todas as transações
        //para cada transação,
        Transaction.all.forEach(transaction => {
        //verificar se é menor que 0
        if( transaction.amount < 0) {
        //somar uma variavel e retornar a variavel
        //income = income + transaction.amount;
            expense += transaction.amount;
     }   
    })
    
        return expense;
    },

    //entradas-saídas, responsável pelo calculo matematico
    total() {
        //+ pq o sinal de negativo já está guardado
        return Transaction.incomes() + Transaction.expenses();
    }

}

const DOM = {
    transactionsContainer: document.querySelector('#data-table tbody'),

    addTransaction(transaction, index) {
        
        const tr = document.createElement('tr')
        tr.innerHTML = DOM.innerHTMLTransaction(transaction, index)
        tr.dataset.index = index

        DOM.transactionsContainer.appendChild(tr)
     },


    innerHTMLTransaction(transaction, index){
        //transaction.amount é maior q 0 então coloque a classe income se não coloque expense
      const CSSclass = transaction.amount > 0 ? "income" : "expense"
      
      const amount = Utils.formatCurrency(transaction.amount)
      
      const html= `
      <tr>
            <td class="description">${transaction.description}</td>
            <td class="${CSSclass}">${amount}</td>
            <td class:="date">${transaction.date}</td>
            <td>
                <img onclick="Transaction.remove(${index})" src="./assets/minus.svg" alt="Remover transação">
            </td>
        </tr>
        `
        return html
    },

    //responsável por deixar bonito na tela/ parte visual
    updateBalance(){
        document
        .getElementById('incomeDisplay')
        .innerHTML = Utils.formatCurrency(Transaction.incomes())
        document
        .getElementById('expenseDisplay')
        .innerHTML = Utils.formatCurrency(Transaction.expenses())
        document
        .getElementById('totalDisplay')
        .innerHTML = Utils.formatCurrency(Transaction.total())

    },

    clearTransactions (){
        DOM.transactionsContainer.innerHTML = ""
    }
}


const Utils = {
    formatAmount(value){
        value = Number(value) * 100
        return value
    },

    formatDate(date){
        //split realiza separações
        const splittedDate = date.split("-")
        return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`
    },
    
    formatCurrency(value){
        const signal = Number (value) < 0 ? "-" : ""

        //transforma linha em string /\D/g -> é uma expressão regular, acha tudo que é número g é uma expressão global
        value = String(value).replace(/\D/g, "")

        value = Number(value) / 100

        // formata o número como real brasileiro
        value= value.toLocaleString("pt-BR",{
            style: "currency",
            currency: "BRL"
        })


        return signal + value
    }
}

const Form = {
    //linka js com html
    //pega o elemento inteiro
    description: document.querySelector('input#description'),
    amount: document.querySelector('input#amount'),
    date: document.querySelector('input#date'),

    //pega somente os valores
    getValues(){
        return{
            description: Form.description.value,
            amount: Form.amount.value,
            date: Form.date.value
        }
    },

    validateFields(){
        const { description, amount, date} = Form.getValues()

        //trim realiza limpeza de espaços vazios, a função verifica se o espaço esta vazio( o trim não, o restante da funçao)
        if(description.trim()=="" || 
           amount.trim()=="" || 
           date.trim()== "" ){
               throw new Error("Por favor, preencha todos os campos")
           }
    },

    formatValues(){
        let { description, amount, date} = Form.getValues()
        
        amount = Utils.formatAmount(amount)

        date = Utils.formatDate(date)

        return {
            description,
            amount,
            date
        }
    },

    clearFields(){
        Form.description.value = ""
        Form.amount.value = ""
        Form.date.value = ""
    },

    submit(event) {
        //interrompe comportamento padrão, para poder fazer funcionalidades personalizadas
        event.preventDefault()
        //trata o evento de erro 
        try{
            //verificar se todas as informações foram preenchidas
            //Form.validateFields()
            //formatar dados para salvar
            const transaction = Form.formatValues()
             //salvar
            Transaction.add(transaction)
            //apagar dados do formulário
            Form.clearFields()
            //fechar modal
            Modal.close()
            //atualização da aplicação
            //App.reload()

        } catch (error){
            alert(error.message)
        }
    }
}

const App = {
    init() {
        //após a execução do app.init irá popular os campos
        //adiciona as transações que ja existem na tela
        Transaction.all.forEach((transaction,index) => {
        DOM.addTransaction(transaction, index)
    })
 
    DOM.updateBalance()

    Storage.set(Transaction.all)
        
},
    // após adicionar, ira fazer um reload
    reload() {
        DOM.clearTransactions()
    //vai para app.init de novo e reinicia tudo novamente
        App.init()
    },
}
//após registrar tudo entra nessa linha
App.init()

