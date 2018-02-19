# -*- coding: utf-8 -*-
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import Select
from selenium.common.exceptions import NoSuchElementException
from selenium.common.exceptions import NoAlertPresentException
import unittest, time, re

class MangerCustomerSuccess(unittest.TestCase):
    def setUp(self):
        self.driver = webdriver.Firefox()
        self.driver.implicitly_wait(30)
        self.base_url = "https://www.katalon.com/"
        self.verificationErrors = []
        self.accept_next_alert = True
    
    def test_manger_customer_success(self):
        driver = self.driver
        driver.get("http://127.0.0.1:8100/#/app/login")
        driver.get("http://127.0.0.1:8100/#/app/demo-people")
        driver.find_element_by_id("H6VM010WeHlioM5JZv1O9G").click()
        driver.find_element_by_xpath("(//img[@title='Demo User'])[2]").click()
        driver.find_element_by_xpath("//html").click()
        driver.find_element_by_id("scan").click()
        driver.find_element_by_xpath("//img[@title='Demo User']").click()
        driver.find_element_by_xpath("//ion-view[@id='customerPage']/ion-content/div/div/button").click()
        driver.find_element_by_xpath("//table[@id='keypad']/tbody/tr[3]/td").click()
        driver.find_element_by_xpath("//table[@id='keypad']/tbody/tr[3]/td[2]").click()
        driver.find_element_by_xpath("//table[@id='keypad']/tbody/tr[3]/td[3]").click()
        driver.find_element_by_xpath("//section[3]/button").click()
        driver.find_element_by_id("backHome").click()
        driver.find_element_by_xpath("//div[2]/ion-header-bar/div/span/button").click()
        driver.find_element_by_xpath("//ion-side-menu/ion-content/div/ion-list/div/ion-item[5]").click()
        driver.find_element_by_xpath("//ion-item[6]/div").click()
        driver.find_element_by_xpath("//div[2]/button[2]").click()
    
    def is_element_present(self, how, what):
        try: self.driver.find_element(by=how, value=what)
        except NoSuchElementException as e: return False
        return True
    
    def is_alert_present(self):
        try: self.driver.switch_to_alert()
        except NoAlertPresentException as e: return False
        return True
    
    def close_alert_and_get_its_text(self):
        try:
            alert = self.driver.switch_to_alert()
            alert_text = alert.text
            if self.accept_next_alert:
                alert.accept()
            else:
                alert.dismiss()
            return alert_text
        finally: self.accept_next_alert = True
    
    def tearDown(self):
        self.driver.quit()
        self.assertEqual([], self.verificationErrors)

if __name__ == "__main__":
    unittest.main()
