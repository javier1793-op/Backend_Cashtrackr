import { Router } from "express";
import { BudgetController } from "../controllers/BudgetController";
import { handleInputErrors } from "../middleware/validator";
import { budgetsId, hasAccess, validateBudgetExists, validateBudgetInput } from "../middleware/budgetsId";
import { ExpensesController } from "../controllers/ExpensesController";
import { expenseId, validateExpenseExists, validateExpenseInput } from "../middleware/expense";
import { authenticate } from "../middleware/auth";

const router = Router()

router.use(authenticate)

router.param('BudgetId',budgetsId)
router.param('BudgetId',validateBudgetExists)
router.param('BudgetId',hasAccess)

router.param('ExpenseId',expenseId)
router.param('ExpenseId',validateExpenseExists)

router.get('/',BudgetController.getAll)

router.post('/',
    validateBudgetInput,
    handleInputErrors,
    BudgetController.create)

router.get('/:BudgetId',BudgetController.getById)

router.put('/:BudgetId',
    validateBudgetInput,
    handleInputErrors,
    BudgetController.updateById)

router.delete('/:BudgetId',BudgetController.deleteById)

/** Routes for expenses */

router.post('/:BudgetId/expense',
    validateExpenseInput,
    handleInputErrors,
    ExpensesController.create)

router.get('/:BudgetId/expense/:ExpenseId',ExpensesController.getById)
router.put('/:BudgetId/expense/:ExpenseId',
    validateExpenseInput,
    handleInputErrors,
    ExpensesController.updateById)
router.delete('/:BudgetId/expense/:ExpenseId',ExpensesController.deleteById)

export default router