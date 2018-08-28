App = {
  web3Provider: null,
  contracts: {},
  account: 0x0,
  loading: false,

  init: function() {
    return App.initWeb3();
  },

  initWeb3: function() {
    // @dev initialize web3
    if(typeof web3 !== 'undefined') {
      // @dev reuse the provider of the Web3 object injected by Metamask
      App.web3Provider = web3.currentProvider;
    } else {
      // @dev create a new provider and plug it directly into our local node
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
    }
    web3 = new Web3(App.web3Provider);

    App.displayAccountInfo();

    return App.initContract();
  },

  displayAccountInfo: function() {
    web3.eth.getCoinbase(function(err, account) {
      if(err === null) {
        App.account = account;
        $('#account').text(account);
        web3.eth.getBalance(account, function(err, balance) {
          if(err === null) {
            $('#accountBalance').text(web3.fromWei(balance, "ether") + " ETH");
          }
        });
      }
    });
  },

  // @dev init function
  initContract: function() {
    $.getJSON('InvestmentScreen.json', function(investmentScreenArtifact) {
      // @dev get the contract artifact file and use it to instantiate a truffle contract abstraction
      App.contracts.InvestmentScreen = TruffleContract(investmentScreenArtifact);
      // @dev set the provider for contracts
      App.contracts.InvestmentScreen.setProvider(App.web3Provider);
      // @dev listen to listenToEvents
      App.listenToEvents();
      // @dev retrieve the opportunity from the contract
      return App.reloadOpportunities();
    });
  },

  // @dev refresh the UI after activity
  reloadOpportunities: function() {
    // @dev avoid reentry
    if(App.loading == true) {
      return;
    }

    App.loading = true;

    // @dev refresh account information because the balance might have changed
    App.displayAccountInfo();

    var investmentScreenInstance;

    App.contracts.InvestmentScreen.deployed().then(function(instance) {
      investmentScreenInstance = instance;
      return instance.getAvailableOpportunities();
    }).then(function(opportunityIds) {

      $('#opportunityRow').empty();

      // @dev iterate to fill rows with available opportunities
      for (var i = 0; i < opportunityIds.length; i++) {
        opportunityId = opportunityIds[i];
          investmentScreenInstance.opportunities(opportunityId.toNumber()).then(function(opportunity){

          App.displayOpportunity(opportunity[0], opportunity[1], opportunity[4], opportunity[5], opportunity[6], opportunity[3], opportunity[8], opportunity[9], opportunity[10], opportunity[11]);
        });
      }

      App.loading = false;

    }).catch(function(err) {
      console.error(err.message);
      App.loading = false;
    });
  },

  // @dev function to display items in interface on reload
  displayOpportunity: function(id, investee, name, description, price, status, investor, endorsement1, endorsement2, endorsement3) {
    var opportunityRow = $('#opportunityRow');
    var etherPrice = web3.fromWei(price,"ether");
    var opportunityTemplate = $('#opportunityTemplate');

    // @dev update UI elements
    opportunityTemplate.find('.panel-title').text(name);
    opportunityTemplate.find('.opportunity-description').text(description);
    opportunityTemplate.find('.opportunity-price').text(etherPrice + " ETH");
    opportunityTemplate.find('.opportunity-status').text(status);
    opportunityTemplate.find('.opportunity-endorsement1').text(endorsement1);
    opportunityTemplate.find('.opportunity-endorsement2').text(endorsement2);
    opportunityTemplate.find('.opportunity-endorsement3').text(endorsement3);
    opportunityTemplate.find('.opportunity-investor').text(investor);
    opportunityTemplate.find('.btn-fund').attr('data-id', id);
    opportunityTemplate.find('.btn-rank').attr('data-id', id);
    opportunityTemplate.find('.btn-fund').attr('data-value',etherPrice);

    // @dev check the accounts and update button displays/options
    if(investee == App.account) {
      // @dev investee is the current user
      opportunityTemplate.find('.opportunity-investee').text("You");
      opportunityTemplate.find('.btn-fund').hide();
      opportunityTemplate.find('.btn-rank').hide();
    } else {
      // @dev all other users
      opportunityTemplate.find('.opportunity-investee').text(investee);
      opportunityTemplate.find('.btn-fund').hide();
      opportunityTemplate.find('.btn-rank').hide();
      if (status == "Investment needs additional screening" && endorsement1 != App.account && endorsement2 != App.account) {
        // @dev investment is still in the screening phase but also must ensure that the user has not previously endorsed the opportunity
        opportunityTemplate.find('.btn-rank').show();
      }
      if (status == "Investment has been screened and is ready for funding") {
        // @dev  investment is ready for funding
        opportunityTemplate.find('.btn-fund').show();
      }
    }

    // @dev add this new opportunity to the listenToEvents
    opportunityRow.append(opportunityTemplate.html());

  },

  // @dev function for creating a new opportunity
  createOpportunity: function() {
    // @dev retrieve the detail of the opportunity
    var _opportunity_name = $('#opportunity_name').val();
    var _description = $('#opportunity_description').val();
    var _price = web3.toWei(parseFloat($('#opportunity_price').val() || 0), "ether");

    if((_opportunity_name.trim() == '') || (_price == 0)) {
      // @dev No opportunities available
      return false;
    }

    App.contracts.InvestmentScreen.deployed().then(function(instance) {
      return instance.createOpportunity(_opportunity_name, _description, _price, {
        from: App.account,
        gas: 500000
      });
    }).then(function(result) {

    }).catch(function(err) {
      console.error(err);
    });
  },

  // @dev function to endorse an opportunity
  endorseOpportunity: function() {
    // @dev retrieve the detail of the opportunity
    event.preventDefault();

    // @dev Retrieve the opportunity fundingTarget
    var _opportunityId = $(event.target).data('id');

    console.log("This is the opportunity Id " + _opportunityId);

    App.contracts.InvestmentScreen.deployed().then(function(instance) {
      return instance.assessOpportunity(_opportunityId, {
        from: App.account,
        gas: 500000
      });

    }).then(function(result) {
      console.log(result);
    }).catch(function(err) {
      console.error(err);
    });
  },

  // @dev listen to events triggered by the contract
  listenToEvents: function() {
    App.contracts.InvestmentScreen.deployed().then(function(instance) {
      // @dev opportunity has been created
      instance.OpportunitySnapshot({}, {}).watch(function(error, event) {
        if(!error) {
          $('#events').append('<li class="list-group-item">' + event.args._opportunityName + ' is now for sale!</li>');

        } else {
          console.error(error);
        }
        App.reloadOpportunities();
      });

      // @dev Event opportunity has been endorsed
      instance.OpportunityEndorsed({}, {}).watch(function(error, event) {
        if(!error) {
          $('#events').append('<li class="list-group-item">' + event.args._screener + ' has endorsed ' + event.args._opportunityName + '!</li>');

        } else {
          console.error(error);
        }
        App.reloadOpportunities();
      });

      // @dev Event opportunity has been funded
      instance.OpportunityFunded({}, {}).watch(function(error, event) {
        if(!error) {
          $('#events').append('<li class="list-group-item">' + event.args._investor + ' has funded ' + event.args._opportunityName + '</li>');
        } else {
          console.error(error);
        }
        App.reloadOpportunities();
      });
    });
  },

  fundOpportunity: function() {
    event.preventDefault();

    // @dev Retrieve the opportunity fundingTarget
    var _opportunityId = $(event.target).data('id');
    var _fundingTarget = parseFloat($(event.target).data('value'));

    App.contracts.InvestmentScreen.deployed().then(function(instance){
      return instance.fundOpportunity(_opportunityId, {
        from: App.account,
        value: web3.toWei(_fundingTarget,"ether"),
        gas: 500000
      });
    }).catch(function(error){
      console.error(error);
    });
  }
};

$(function() {
  $(window).load(function() {
    App.init();
  });
});
