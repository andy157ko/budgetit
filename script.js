document.addEventListener("DOMContentLoaded", function () {
  const pieChartCanvas = document.getElementById("pieChart");
  const ctx = pieChartCanvas.getContext("2d");
  let pieChart;
  let monthlySalary;
  let originalMonthlySalary;

  const salaryCenterPlugin = {
    afterDraw: function (chart) {
      if (chart.config.type !== 'pie') return;
  
      const ctx = chart.ctx;
      const chartArea = chart.chartArea;
      const centerX = (chartArea.left + chartArea.right) / 2;
      const centerY = (chartArea.top + chartArea.bottom) / 2;
  
      ctx.fillStyle = '#000';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = '20px Montserrat';
  
      ctx.fillText('$' + monthlySalary.toFixed(2), centerX, centerY);
    },
  };

  function renderChart(presetUtilitiesPercentage, presetSavingsPercentage, presetPersonalNeedsPercentage, personalizedCategories) {
    const labels = [];
    const data = [];
    const backgroundColor = [];
    const amounts = [];

    if (presetUtilitiesPercentage > 0) {
      labels.push("Utilities");
      data.push(presetUtilitiesPercentage);
      backgroundColor.push("#007BFF");
      amounts.push((presetUtilitiesPercentage / 100 * originalMonthlySalary).toFixed(2)); 
    }

    if (presetSavingsPercentage > 0) {
      labels.push("Savings");
      data.push(presetSavingsPercentage);
      backgroundColor.push("#FADADD");
      amounts.push((presetSavingsPercentage / 100 * originalMonthlySalary).toFixed(2)); 
    }

    if (presetPersonalNeedsPercentage > 0) {
      labels.push("Personal Needs");
      data.push(presetPersonalNeedsPercentage);
      backgroundColor.push("#FFC107");
      amounts.push((presetPersonalNeedsPercentage / 100 * originalMonthlySalary).toFixed(2)); 
    }

    personalizedCategories.forEach(category => {
      labels.push(category.name);
      data.push(category.percentage);
      backgroundColor.push(category.color);
      amounts.push((category.percentage / 100 * originalMonthlySalary).toFixed(2));
    });

    const chartData = {
      labels: labels,
      datasets: [
        {
          data: data,
          backgroundColor: backgroundColor,
          borderWidth: 0
        }
      ]
    };
    const options = {
      plugins: {
        legend: {
          display: true,
          position: 'bottom'
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              const index = context.dataIndex;
              const label = context.chart.data.labels[index];
              const value = context.chart.data.datasets[0].data[index];
              const amount = (value / 100 * originalMonthlySalary).toFixed(2);
              return label + ': $' + amount;
            }
          }
        }
      },
      cutout: '60%'
    };

    if (typeof pieChart !== 'undefined') {
      pieChart.destroy();
    }

    pieChart = new Chart(ctx, {
      type: "pie",
      data: chartData,
      options: options,
      plugins: [salaryCenterPlugin],
    });
  }

  function updateChartOnButtonPress() {
    const presetContainer = document.querySelector(".preset-container");
    const personalizeContainer = document.querySelector(".personalize-container");
    let monthlySalaryElement;
  
    if (presetContainer.style.display === "block") {
      monthlySalaryElement = document.getElementById("salary-preset");
      originalMonthlySalary = monthlySalary; 
    } else if (personalizeContainer.style.display === "block") {
      monthlySalaryElement = document.getElementById("salary-personalize");
      originalMonthlySalary = monthlySalary; 
    }

    if (presetContainer.style.display === "block") {
      const utilitiesPercentage = parseFloat(document.getElementById("utilities").value.trim());
      const savingsPercentage = parseFloat(document.getElementById("savings").value.trim());
      const personalNeedsPercentage = parseFloat(document.getElementById("personal-needs").value.trim());

      if (monthlySalaryElement && monthlySalaryElement.value.trim() !== "") {
        monthlySalary = parseFloat(monthlySalaryElement.value.trim());
        originalMonthlySalary = monthlySalary; 
      }

      if (
        !isNaN(utilitiesPercentage) && utilitiesPercentage >= 0 && utilitiesPercentage <= 100 &&
        !isNaN(savingsPercentage) && savingsPercentage >= 0 && savingsPercentage <= 100 &&
        !isNaN(personalNeedsPercentage) && personalNeedsPercentage >= 0 && personalNeedsPercentage <= 100 &&
        monthlySalaryElement && monthlySalaryElement.value.trim() !== ""
      ) {
        monthlySalary = parseFloat(monthlySalaryElement.value.trim()); 
        originalMonthlySalary = monthlySalary; 
        renderChart(utilitiesPercentage, savingsPercentage, personalNeedsPercentage, []);
      } else {
        confirm("Invalid input! Percentages should be between 0 and 100, and monthly salary should be provided.");
      }
    } else if (personalizeContainer.style.display === "block") {
      const personalizedCategories = document.querySelectorAll(".personalize-container .category-input");
      const personalizedPercentages = [];

      personalizedCategories.forEach(category => {
        const categoryName = category.querySelector(".category-name").value.trim();
        const categoryPercentage = parseFloat(category.querySelector(".category-percentage").value.trim());
        const categoryColor = category.querySelector(".category-color").value;

        if (categoryName !== "" && !isNaN(categoryPercentage) && categoryPercentage >= 0 && categoryPercentage <= 100) {
          personalizedPercentages.push({ name: categoryName, percentage: categoryPercentage, color: categoryColor });
        } else {
          confirm("Invalid input! Personalized category names cannot be empty, and percentages should be between 0 and 100.");
        }
      });

      if (personalizedPercentages.length > 0 && monthlySalaryElement && monthlySalaryElement.value.trim() !== "") {
        monthlySalary = parseFloat(monthlySalaryElement.value.trim()); // Set the monthly salary value
        originalMonthlySalary = monthlySalary; 
        renderChart(0, 0, 0, personalizedPercentages);
      } else {
        confirm("No personalized categories provided or monthly salary not provided!");
      }
    }
  }
  
    const budgetButton = document.getElementById("budget-button");
    budgetButton.addEventListener("click", updateChartOnButtonPress);
  
    const addCategoryButton = document.getElementById("add-category-btn");
    const categoryContainer = document.querySelector(".personalize-container .category-container");
  
    function addCategoryInput() {
      const newCategoryInput = document.createElement("div");
  
      newCategoryInput.innerHTML = `
        <label for="category-name">Category Name:</label>
        <input type="text" class="category-name" placeholder="Enter category name">
        <label for="category-percentage">Category Percentage (%):</label>
        <input type="number" class="category-percentage" placeholder="Enter category percentage">
        <div class="color-input-container">
          <label for="category-color">Category Color:</label>
          <input type="color" class="category-color" value="#007BFF">
        </div>
      `;
      newCategoryInput.classList.add("category-input");
      categoryContainer.appendChild(newCategoryInput);
    }
  
    addCategoryButton.addEventListener("click", function() {
      addCategoryInput();
    });
  
    const presetBtn = document.getElementById("preset-btn");
    const personalizeBtn = document.getElementById("personalize-btn");
    const presetContainer = document.querySelector(".preset-container");
    const personalizeContainer = document.querySelector(".personalize-container");
  
    function toggleContainers(showPreset) {
      if (showPreset) {
        presetContainer.style.display = "block";
        personalizeContainer.style.display = "none";
      } else {
        presetContainer.style.display = "none";
        personalizeContainer.style.display = "block";
      }
    }
  
    presetBtn.addEventListener("click", function() {
      toggleContainers(true);
      presetBtn.classList.add("active");
      personalizeBtn.classList.remove("active");
    });
  
    personalizeBtn.addEventListener("click", function() {
      toggleContainers(false);
      presetBtn.classList.remove("active");
      personalizeBtn.classList.add("active");
    });

    document.getElementById('clear-category-btn').addEventListener('click', function() {
      var result = confirm("Are you sure you want to clear your budgeting chart? This action cannot be undone.");
    
      if (result) {
        const categoryContainer = document.querySelector('.personalize-container .category-container');
        categoryContainer.innerHTML = ''; 
        document.getElementById('salary-personalize').value = '';
        pieChart.destroy();
        const personalizeGroup = document.querySelector('#spending-category optgroup[label="Personalize"]');
        personalizeGroup.innerHTML = '';
      }
    });
  
    presetBtn.click();

    function updateSpendingCategories() {
      const personalizeGroup = document.querySelector('#spending-category optgroup[label="Personalize"]');
      personalizeGroup.innerHTML = '';
      const presetGroup = document.querySelector('#spending-category optgroup[label="Preset"]');
      presetGroup.innerHTML = ''; 
      const presetCategories = ['Utilities', 'Savings', 'Personal Needs'];
    
      presetCategories.forEach((categoryName) => {
        const option = document.createElement('option');
        option.value = categoryName;
        option.textContent = categoryName;
        presetGroup.appendChild(option);
      });
    
      const personalizedCategories = document.querySelectorAll('.personalize-container .category-container input[type="text"]');
    
      personalizedCategories.forEach((categoryInput) => {
        const categoryName = categoryInput.value;
        const option = document.createElement('option');
        option.value = categoryName;
        option.textContent = categoryName;
        personalizeGroup.appendChild(option);
      });
    }
    
    document.querySelector('#budget-button').addEventListener('click', () => {
      updateSpendingCategories();
    });
    
    updateSpendingCategories();
    
  
    function handleAddFunds(salaryInputId, addFundsButtonId) {
      const salaryInput = document.getElementById(salaryInputId);
      let currentSalary = parseFloat(salaryInput.value) || 0;
    
      const inputField = document.createElement('input');
      inputField.type = 'number';
      inputField.placeholder = 'Enter additional funds';
      inputField.classList.add('add-funds-input');
    
      const addButton = document.createElement('button');
      addButton.textContent = 'Add!';
      addButton.type = 'button';
      addButton.classList.add('add-funds-button');
    
      const container = document.getElementById(addFundsButtonId).parentNode;
      container.appendChild(inputField);
      container.appendChild(addButton);
    
      addButton.addEventListener('click', () => {
        const additionalFunds = parseFloat(inputField.value) || 0;
        monthlySalary = currentSalary + additionalFunds;
        salaryInput.value = monthlySalary;
        updateChartOnButtonPress();
      });
    
      let justCreated = true;
    
      const clickOutside = (event) => {
        if (justCreated) {
          justCreated = false;
          return;
        }
    
        if (!inputField.contains(event.target) && !addButton.contains(event.target)) {
          inputField.remove();
          addButton.remove();
          document.removeEventListener('click', clickOutside);
        }
      };
    
      document.addEventListener('click', clickOutside);
    }

    document.getElementById('add-funds-btn-preset').addEventListener('click', () => handleAddFunds('salary-preset', 'add-funds-btn-preset'));
document.getElementById('add-funds-btn-personalize').addEventListener('click', () => handleAddFunds('salary-personalize', 'add-funds-btn-personalize'));

function updateCategorySpending(categoryName, spendingAmount, isAddingBack = false) {
  const categoryIndex = pieChart.data.labels.indexOf(categoryName);

  if (categoryIndex !== -1) {
    const percentageAllocated = pieChart.data.datasets[0].data[categoryIndex];
    const percentageSpent = spendingAmount / originalMonthlySalary * 100;
    const updatedPercentage = isAddingBack ? percentageAllocated + percentageSpent : percentageAllocated - percentageSpent;

    if (updatedPercentage < 0) {
      return false; 
    }

    pieChart.data.datasets[0].data[categoryIndex] = updatedPercentage;
    pieChart.update();
    return updatedPercentage; 
  } else {
    console.warn(`Category "${categoryName}" not found in the chart.`);
    return false;
  }
}


    document.getElementById('record-spending-btn').addEventListener('click', () => {
      const spendingCategory = document.getElementById('spending-category').value;
      const spendingAmount = parseFloat(document.getElementById('spending-amount').value);
    
      if (isNaN(spendingAmount) || spendingAmount <= 0) {
        alert('Please enter a valid spending amount.');
        return;
      }
          const updatedPercentage = updateCategorySpending(spendingCategory, spendingAmount);

      if (updatedPercentage === false) {
        alert('You are attempting to record an amount greater than available in this category. Please enter a valid amount.');
        return;
      }
        
      const value1 = document.getElementById('spending-date').value;
      const value2 = document.getElementById('spending-reason').value;
      const value3 = document.getElementById('spending-amount').value;
      const value4 = document.getElementById('spending-category').value;
    
      const entryDiv = document.createElement('div');
      entryDiv.classList.add('recorded-entry');
    
      const deleteButton = document.createElement('button');
      deleteButton.textContent = 'X';
      deleteButton.classList.add('delete-button');
      deleteButton.addEventListener('click', () => {
        updateCategorySpending(spendingCategory, spendingAmount, true); 
        monthlySalary += spendingAmount;
        entryDiv.remove();
      });
      entryDiv.appendChild(deleteButton);
    
      const value1Element = document.createElement('p');
      value1Element.textContent = `Date: ${value1}`;
      entryDiv.appendChild(value1Element);
    
      const value2Element = document.createElement('p');
      value2Element.textContent = `Reason: ${value2}`;
      entryDiv.appendChild(value2Element);
    
      const value3Element = document.createElement('p');
      value3Element.textContent = `Amount: $${value3}`;
      entryDiv.appendChild(value3Element);
    
      monthlySalary -= parseFloat(value3);
    
      const value4Element = document.createElement('p');
      value4Element.textContent = `Category: ${value4}`;
      entryDiv.appendChild(value4Element);
    
      document.getElementById('recorded-entries').appendChild(entryDiv);
    });
    

    document.getElementById('clear-spending-btn').addEventListener('click', () => {
      const userConfirmed = confirm('Are you sure you want to clear all spending records?');
    
      if (userConfirmed) {
        pieChart.data.datasets[0].data = pieChart.data.datasets[0].data.map(() => 0);
        pieChart.update();
        document.getElementById('recorded-entries').innerHTML = '';
        pieChart.destroy();
    
        alert('Spending records have been cleared.');
      } else {
        alert('Spending records have not been cleared.');
      }
    });

  });