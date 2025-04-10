"use strict";

(() => {
  MenuSearchService.$inject = ["$http", "ApiUrl"];

  function MenuSearchService($http, ApiUrl) {
    const service = this;

    service.getMatchedMenuItems = (searchTerm) => {
      return $http({
        method: "get",
        url: ApiUrl,
      }).then((response) => {
        const data = response.data;

        return Object.values(data)
          .flatMap(({ menu_items }) => menu_items)
          .filter((menu) =>
            menu.description.toLowerCase().includes(searchTerm.toLowerCase())
          );
      });
    };
  }

  //

  function FoundItemsDirective() {
    const ddo = {
      restrict: "E",
      templateUrl: "found-items.html",
      scope: {
        foundItems: "<",
        onRemove: "&",
      },
    };

    return ddo;
  }

  //

  NarrowItDownController.$inject = ["MenuSearchService"];

  /**
   * @param {MenuSearchService} menuSearchService
   */
  function NarrowItDownController(menuSearchService) {
    const controller = this;

    controller.search = "";

    controller.loading = false;
    controller.error = null;

    controller.foundItems = [];

    controller.searchTerm = () => {
      controller.loading = true;
      controller.error = null;
      controller.foundItems = [];

      const search = controller.search;

      if (!search) {
        controller.loading = false;
        controller.error = "Input search term.";
        return;
      }

      menuSearchService
        .getMatchedMenuItems(search)
        .then((items) => {
          if (!items.length) {
            controller.error = "No items found.";
          } else {
            controller.foundItems = items;
          }
        })
        .finally(() => {
          controller.loading = false;
        });
    };

    controller.removeItem = (index) => {
      controller.foundItems.splice(index, 1);
    };
  }

  //

  const appModule = angular.module("NarrowItDownApp", []);

  appModule.constant(
    "ApiUrl",
    "https://coursera-jhu-default-rtdb.firebaseio.com/menu_items.json"
  );

  appModule.service("MenuSearchService", MenuSearchService);
  appModule.directive("foundItems", FoundItemsDirective);

  appModule.controller("NarrowItDownController", NarrowItDownController);
})();
