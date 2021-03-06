console.log('hello!');

  ////////////////////////////////////////////
 //          MODELS & COLLECTIONS          //
////////////////////////////////////////////
var Form = Backbone.Model.extend({
  url: 'http://tiny-starburst.herokuapp.com/collections/todomel'
});

var ToDo = Backbone.Model.extend({
  urlRoot: 'http://tiny-starburst.herokuapp.com/collections/todomel',
  idAttribute: "_id"
});

var ToDos = Backbone.Collection.extend({
  model: ToDo,
  url:'http://tiny-starburst.herokuapp.com/collections/todomel'
});

  ///////////////////////////////
 //          VIEWS            //
///////////////////////////////
var HomeView = Backbone.View.extend({
  tagName: 'p',
  template: _.template($('#homePageTemplate').html()),
  events: {
    'click .all': 'handleAllClick'
  },
  render: function(){
    console.log('called the "render all" function');
    this.$el.html(this.template());
    return this;
  }
});

var ToDoItem = Backbone.View.extend({
  tagName: 'article',
  className: 'toDo',
  template: _.template($('#toDoTemplate').html()),
  events: {
    'click .circle': 'markCompleted',
    'click .check': 'markCompleted',
    'click .urgentOff': 'markUrgent',
    'click .urgentOn': 'markUrgent',
    'click .xBtn': 'removeItem',
    'click .description': 'editItem',
    'keypress .editBox': 'saveItem'
  },
  markCompleted: function(){
    var circle = this.$('.circle');
    var check = this.$('.check');
    var item = this.$('.itemDetails');
    console.log('you clicked the circle!')
    circle.toggle();
    check.toggle();
    item.toggleClass('completed');
    item.toggleClass('active');
  },
  markUrgent: function(){
    var urgentOff = this.$('.urgentOff');
    var urgentOn = this.$('.urgentOn');
    console.log('you clicked the urgent circle!')
    urgentOff.toggle();
    urgentOn.toggle();
  },
  removeItem: function(){
    var xBtn = this.$('.xBtn');
    var item = this.$('.itemDetails');
    console.log('you clicked the remove x!');
    item.closest('.toDo').toggle('slide');
    this.model.destroy();
  },
  editItem: function(){
    var description = this.$('.description');
    var editBox = this.$('.editBox');
    // var text = this.$('.description').html();
    console.log('you clicked the edit btn!');
    description.toggle();
    editBox.toggle();
    editBox.val(description.html());
  },
  saveItem: function(event){
    if(event.keyCode === 13){
      var description = this.$('.description');
      var editBox = this.$('.editBox');
      event.preventDefault();
      console.log('you pressed enter to save!');
      description.html(editBox.val());
      this.model.save();
      console.log(description.html());
    }
  },
  render: function(){
    var data = this.model.toJSON();
    this.$el.html(this.template(data));
    return this;
  }
});

var ToDoList = Backbone.View.extend({
  tagName: 'section',
  className: 'list',
  initialize: function(){
    this.listenTo(this.collection, 'fetch sync', this.render);
  },

  render: function(){
    var view = this;
    this.$el.html('');
    this.collection.each(function(model){
      var toDoItem = new ToDoItem({
        model: model
      });
      toDoItem.render();
      view.$el.append(toDoItem.el);
    });
  }
});

var FormView = Backbone.View.extend({
  tagName: 'form',
  template: _.template($('#formTemplate').html()),
  events: {
    'keypress .item': 'handleEnter', //when key is pressed while focus is in the .item box
    'keypress .dueDate': 'handleEnter',
    'keypress .urgent': 'handleEnter',
    'click .urgent': 'handleToday',
    'click .showCompleted': 'handleShowCompleted'
  },
  send: function(){
    var description = $('.item').val();
    var deadline = $('.dueDate').val();
    var urgent = $('.urgent').is(':checked');
    var isDone = false;

    if(description.trim() === ''){
      return;
    }
    var toDo = new ToDo({  //create new instance of the ToDo model to send to server
      description: description,
      created: Date.now(),
      deadline: deadline,
      urgent: urgent,
      isDone: isDone,
    });
    toDo.save(); //save the todo item to the server

    this.collection.add(toDo, {at: [0]}); //this will append the newly created item to the list.
    this.$('.item').val('');
    $('.dueDate').val('');
    $('.dueDate').show('');
    this.$('.urgent').prop('checked', false);
  },

  handleEnter: function(event){
    if(event.keyCode === 13){
      event.preventDefault();
      this.send();
    }
  },
  handleToday: function(){
    var urgent = this.$('.urgent').is(':checked');
    $('.dueDate').toggle();
  },
  // handleShowCompleted: function(){
  //   var showCompleted = $('.showCompleted');
  //   console.log('you clicked the completed btn!')
  //   this.collection.remove(showCompleted);
  // },
  render: function(){
    var formTemplate = $('#formTemplate').html();
    this.$el.html(formTemplate);
    return this;
  }
});

  ///////////////////////////////
 //          ROUTER           //
///////////////////////////////

var Router = Backbone.Router.extend({
  routes: {
    '': 'home',
    'urgent': 'urgent',
    'completed': 'completed'
  },
  home: function(){
    //setup
    var mainView = new HomeView();
    var toDos = new ToDos();
    var toDoList = new ToDoList({ //instance of your collection
        collection: toDos
    });
    var form = new FormView({
      collection: toDos
    });
    form.render();
    $('main').append(form.el);
    //Render
    mainView.render();
    $('header').append(mainView.el);

    toDos.fetch({
      success: function(){
        //Attach to page
        // $('header').html(mainView.el);
        $('main').append(toDoList.el);
      }
    });
  },
});

var router = new Router();
Backbone.history.start();
