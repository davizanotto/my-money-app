const BillingCycle = require('./billingCycle')
const errorHandler = require('../common/errorHandler')

BillingCycle.methods(['get', 'post', 'put', 'delete'])
BillingCycle.updateOptions({new: true, runValidators: true})

// Middleware para tratativa dos erros no padrão de resposta que desejamos
BillingCycle.after('post', errorHandler).after('put', errorHandler)

BillingCycle.route('count', (req, res, next) => {
    BillingCycle.count((error, value) => {
        if(error) {
            res.status(500).json({errors: [error]})
        } else {
            res.json({value})
        }
    })
})

BillingCycle.route('summary', (req, res, next) => {
    BillingCycle.aggregate(
        // Formata o json para exibir somente credits.value e debts.value por registro
        { $project: {credit: {$sum: "$credits.value"}, debt: {$sum: "$debts.value"}} },

        // Formata o json para somar todos os credits.value e debts.value e retornar um único registro
        { $group: {_id: null, credit: {$sum: "$credit"}, debt: {$sum: "$debt"}} },

        // Retira o campo _id do json que será retornado
        { $project: {_id: 0, credit: 1, debt: 1} },
        
        // Callback para tratar erro ou retornar o resultado
        (error, result) => {
            if(error) {
                rs.status(500).json({errors: [error]})
            } else {
                res.json(result[0] || {credit: 0, debt: 0}) //retornando índice 0 visto que sabemos que só terá um registro
            }
        }
    )
})

module.exports = BillingCycle