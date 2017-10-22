//BUDGET CONTROLLER
var budgetController =  ( function() {
    
    var Expense = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };
    
    Expense.prototype.calcPercentages = function(totalIncome) {
        
        if (totalIncome > 0){
            this.percentage = Math.round((this.value / totalIncome) * 100);
        } else {
            this.percentage = -1;
        }
     };
    
    Expense.prototype.getPercentages = function() {
      return this.percentage;  
    };
    
    var Income = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };
    
    var calculateTotal = function(type) {
        var sum = 0;
        
        data.allItems[type].forEach(function(cur) { 
            sum += cur.value;
        });
        
        data.totals[type] = sum;
    };
    
    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1
    };
   
    return {
        addItem: function(type, des, val) {
            
            var newItem, ID;
            ID = 0;
            
            // ID = last ID + 1;
            
            // Create new ID
            if (data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else {
                ID = 0;
            }
            
            // Create new item based on 'inc' ore 'exp' type
            if (type === 'inc') {
                newItem = new Income(ID, des, val);
            } else if (type === 'exp') {
                newItem = new Expense(ID, des, val)
            }
            
            // Push it into data structure
            data.allItems[type].push(newItem);
            
            // Return the new element
            return newItem;
        },
        
        deleteItem: function(type,id){
        
            var ids, index;
            
            // 1. id = 6
            
            // ids = [1 2 4 6 8]
            
            ids = data.allItems[type].map(function(current) {
                return current.id;
            });
            
            index = ids.indexOf(id);
            
            if(index !== -1){
                data.allItems[type].splice(index,1);
            }
        },
        
        calculateBudget: function() {
            // Calculate total incom and expenses
            calculateTotal('exp');
            calculateTotal('inc');
            
            // Calculate budget: income - expenses
            data.budget = data.totals.inc - data.totals.exp;
            
            // calculate the percentage of income that we spent
            if(data.totals.inc > 0){
                data.percentage = Math.floor((data.totals.exp / data.totals.inc) * 100);
            } else {
                data.percentage = -1;
            }
        },
        
        
        getBudget: function() {
            return {
                budget: data.budget,
                percentage: data.percentage,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp
            }
        },   
        
        calculatePercentages: function() {
            data.allItems.exp.forEach(function(current) {
                 current.calcPercentages(data.totals.inc);
            });
        },
        
        getPercentages: function() {
            var allPercentage = data.allItems.exp.map(function(cur) {
                return cur.getPercentages();                                          
            });
            return allPercentage;
        },
        
        testing: function(){
            console.log(data);
        }
    };
    
})();



//UI CONTROLLER
var UIController = ( function() {
    
    var DOMstrings = {
      inputType: '.add__type',
      inputDescription: '.add__description',
      inputValue: '.add__value',
      inputBtn: '.add__btn',
      incomeContainer: '.income__list',
      expensesContainer: '.expenses__list',
      budgetLabel: '.budget__value',
      incomeLabel: '.budget__income--value',
      expensesLabel: '.budget__expenses--value',
      percentageLabel: '.budget__expenses--percentage',
      expensesPercLabel: '.item__percentage',
      container: '.container'    
    };
    
    
    var formatNumber = function(num,type) {
        var numSplit, int, dec;
            /*
                + or - before the numbers
                exactly 2 decimal points
                comma separating the thousands
                
                2385.5685 -> + 2,385.56
                
            */
            
        num = Math.abs(num);
        num = num.toFixed(2);
            
        numSplit = num.split('.');
            
        int = numSplit[0];
        if (int.length > 3){
            int = int.substr(0,int.length - 3) + ',' + int.substr(int.length - 3, 3);  // inp: 2345, out: 2,345
        }
            
        dec = numSplit[1];
            
        return ( type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;
    };
    
    return { 
        getInput: function() {  
            return {
                type: document.querySelector(DOMstrings.inputType).value,    
                description: document.querySelector(DOMstrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
            };
        },
        
        addListItem: function(obj, type) {
            
            var html, newHtml, element;
            
            // Create HTML string with placeholder text
            if (type === 'inc') {
                element = DOMstrings.incomeContainer;
                
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            } else if (type === 'exp') {
                element = DOMstrings.expensesContainer;
                
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }
            
            // Replace placeholder text with some actual data
            newHtml = html.replace('%id%',obj.id);
            newHtml = newHtml.replace('%description%',obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));
            
            //Insert HTML into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
            
        },
        
        deleteItem: function(selectorID) {
            var el = document.getElementById(selectorID);
            
            el.parentNode.removeChild(el);
        },
        
        clearFields: function() {
            var fields, fieldsArr;
            
            fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue );
            fieldsArr = Array.prototype.slice.call(fields);
            
            fieldsArr.forEach(function(current, index, array) {
                current.value = '';
            });
            
            fieldsArr[0].focus();
        },
        
        displayBudget: function(obj) {
            var type;
            
            obj.budget > 0 ? type = 'inc' : type = 'exp';
            
            document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget,type);
            document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
            document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalExp, 'exp');
            
            if (obj.percentage > 0){
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + ' %';
            } else {
                document.querySelector(DOMstrings.percentageLabel).textContent = '---';
            }
        },
        
        displayPercentages: function(percentages){
            var fields = document.querySelectorAll(DOMstrings.expensesPercLabel);
            
            var nodeListForEach = function(list, callback) {
                for(var i = 0; i < list.length; i++ ){
                    callback(list[i], i);
                }
            };
            
            nodeListForEach(fields, function(current, index){
                
                if (percentages[index] > 0){
                    current.textContent = percentages[index] + '%';
                } else {
                    current.textContent = '---';
                }
            });
            
        },
        
        getDOMstrings: function() {
            return DOMstrings;
        }
        
    };
    
})();



// GLOBAL APP CONTROLLER
var controller = ( function(budgetCtrl, UICtrl) {
    
    var setupEventListeners = function() {  
        var DOM = UICtrl.getDOMstrings();
        
        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);

        document.addEventListener('keypress', function(event){

        if(event.keyCode === 13 || event.which === 13){
            ctrlAddItem();
        }

        });    
        
        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
        
    };
    
    var updateBudget = function() {
        var budget;
        
        // 1. Calculate the budget
        budgetCtrl.calculateBudget();
        
        // 2. Return the budget
        budget = budgetCtrl.getBudget();
        // 3. Update the budget on the UI
        UICtrl.displayBudget(budget);
    };
    
    var updatePercentages = function() {
        var totalInc;
        
        // 1. Calculate the percentages
        budgetCtrl.calculatePercentages();
        
        // 2. Read them from Budget Controller
        var percentages = budgetCtrl.getPercentages();
        
        // 3. Update percenatge in UI
        UICtrl.displayPercentages(percentages);
        
    };
    
    var ctrlAddItem = function() {
        var input, newItem;
        
        // 1. Get the field input data
        input = UICtrl.getInput();
        
        if(input.description !== "" && !isNaN(input.value) && input.value > 0) {    
            // 2. Add the item to the budget controller
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);

            // 3. Add the item to the UI
            UICtrl.addListItem(newItem, input.type);

            // 4. Clear the fields
            UICtrl.clearFields();

            // 5. Calculate and update budget
            updateBudget();
            
            // 6. Calculate and update percenatges
            updatePercentages();
            
        }
    };  
    
    var ctrlDeleteItem = function(event) {
        var itemID, splitID, type, ID;
        
        
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
        
        if (itemID) {
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);
            
            // 1 . Delete the item from the data structure
            budgetCtrl.deleteItem(type,ID);
            
            // 2. Delete the item from the UI
            UICtrl.deleteItem(itemID);
            
            // 3. Update the budget
            updateBudget();
            
            // 4. Calculate and update percenatges
            updatePercentages();
        }
    };
    
    return {
        init: function() {
            console.log('Application has started');
            UICtrl.displayBudget({
                budget: 0,
                percentage: -1,
                totalInc: 0,
                totalExp: 0
            });
            setupEventListeners();
        }
    };
    
})(budgetController, UIController);

controller.init(); 












